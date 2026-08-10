const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8' }
});

function cleanText(value, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}

function extractInteractionText(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
  const chunks = [];
  for (const step of Array.isArray(data?.steps) ? data.steps : []) {
    if (step?.type !== 'model_output') continue;
    for (const part of Array.isArray(step?.content) ? step.content : []) {
      if (part?.type === 'text' && typeof part.text === 'string') chunks.push(part.text);
    }
  }
  return chunks.join('').trim();
}

export async function POST(request) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return json({ error: 'Gemini AI Helper is not configured yet. Add GEMINI_API_KEY to the hosting environment.' }, 503);
  }

  let body;
  try { body = await request.json(); }
  catch { return json({ error: 'Invalid request.' }, 400); }

  const category = cleanText(body.category, 80) || 'General Knowledge';
  const roundType = body.roundType === 'music' ? 'music' : 'standard';
  const difficulty = ['easy','medium','hard','mixed'].includes(body.difficulty) ? body.difficulty : 'medium';
  const focus = cleanText(body.focus, 300);
  const count = Math.max(1, Math.min(10, Number(body.count) || 1));
  const existing = Array.isArray(body.existing)
    ? body.existing.slice(0, 30).map(x => cleanText(x, 300)).filter(Boolean)
    : [];

  const systemInstruction = roundType === 'music'
    ? `You are a professional live trivia music-round producer. Suggest real, recognizable songs that fit the requested category/theme and difficulty. Never invent a song or artist. Avoid duplicates or near-duplicates from the supplied existing list. Return each item with an empty question string and an answer formatted exactly as "Song Title — Artist". A human host will play the songs externally from a phone, so do not add clues, commentary, album names, or years unless those are naturally part of a title.`
    : `You are a professional pub-trivia question writer. Create fun, accurate, unambiguous open-answer trivia questions. Each question must have one clearly accepted concise answer. Prefer stable facts unlikely to change. Avoid trick wording, disputed claims, current office-holders, and questions where several answers are equally correct unless the user's focus specifically requires them. Avoid duplicates or near-duplicates from the supplied existing list. Do not use multiple choice. Do not mention that you are an AI.`;

  const context = {
    category,
    roundType,
    difficulty,
    focus: focus || 'No additional restriction.',
    count,
    existing
  };

  const schema = {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        minItems: count,
        maxItems: count,
        items: {
          type: 'object',
          properties: {
            question: { type: 'string' },
            answer: { type: 'string' }
          },
          required: ['question','answer'],
          additionalProperties: false
        }
      }
    },
    required: ['items'],
    additionalProperties: false
  };

  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

  try {
    const gemini = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: {
        'x-goog-api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model,
        system_instruction: systemInstruction,
        input: `Generate exactly ${count} item(s) using this trivia-round context:\n${JSON.stringify(context)}`,
        response_format: [{
          type: 'text',
          mime_type: 'application/json',
          schema
        }]
      })
    });

    const data = await gemini.json().catch(() => ({}));
    if (!gemini.ok) {
      console.error('Gemini API error', data?.error?.message || data);
      const message = data?.error?.message || '';
      if (/quota|rate limit|resource exhausted/i.test(message)) {
        return json({ error: 'Gemini has reached its current API limit. Try again later or use Offline Suggestion.' }, 429);
      }
      if (/api key|permission|unauthenticated|forbidden/i.test(message)) {
        return json({ error: 'The Gemini API key is not valid or does not have access. Check GEMINI_API_KEY in your hosting settings.' }, 502);
      }
      return json({ error: 'Gemini could not generate a question right now. Offline Suggestion is still available.' }, 502);
    }

    const outputText = extractInteractionText(data);
    if (!outputText) return json({ error: 'Gemini returned an empty response.' }, 502);

    let parsed;
    try { parsed = JSON.parse(outputText); }
    catch {
      console.error('Gemini returned non-JSON output', outputText.slice(0, 500));
      return json({ error: 'Gemini returned a response the Trivia Helper could not read.' }, 502);
    }

    const rawItems = Array.isArray(parsed?.items) ? parsed.items : [];
    const items = rawItems
      .map(item => ({
        question: roundType === 'music' ? '' : cleanText(item?.question, 600),
        answer: cleanText(item?.answer, 300)
      }))
      .filter(item => roundType === 'music' ? item.answer : (item.question && item.answer))
      .slice(0, count);

    if (!items.length) return json({ error: 'Gemini did not return a usable trivia item.' }, 502);
    return json({ items, provider: 'gemini', model });
  } catch (error) {
    console.error('Gemini AI helper failure', error);
    return json({ error: 'The Gemini AI Helper could not connect. Offline Suggestion is still available.' }, 502);
  }
}

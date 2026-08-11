const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control':'no-store' }
});

function cleanText(value, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}

function extractText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts.map(p => typeof p?.text === 'string' ? p.text : '').join('').trim();
}

async function handle(request) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

  if (request.method === 'GET') {
    return json({ ok:true, configured:Boolean(apiKey), model, service:'Gemini Trivia Helper' });
  }
  if (request.method !== 'POST') return json({ error:'Method not allowed.' }, 405);

  if (!apiKey) {
    return json({ error:'Gemini is not configured on Vercel yet. Add GEMINI_API_KEY under Project → Settings → Environment Variables, then redeploy.' }, 503);
  }

  let body;
  try { body = await request.json(); }
  catch { return json({ error:'Invalid request.' }, 400); }

  const category = cleanText(body.category, 80) || 'General Knowledge';
  const roundType = body.roundType === 'music' ? 'music' : 'standard';
  const difficulty = ['easy','medium','hard','mixed'].includes(body.difficulty) ? body.difficulty : 'medium';
  const focus = cleanText(body.focus, 300);
  const count = Math.max(1, Math.min(10, Number(body.count) || 1));
  const existing = Array.isArray(body.existing)
    ? body.existing.slice(0, 30).map(x => cleanText(x, 300)).filter(Boolean)
    : [];

  const systemInstruction = roundType === 'music'
    ? 'You are a professional live trivia music-round producer. Suggest real, recognizable songs matching the category/theme and difficulty. Never invent a song or artist. Avoid duplicates from the supplied existing list. Return an empty question string and an answer formatted exactly as "Song Title — Artist". Do not add commentary.'
    : 'You are a professional pub-trivia question writer. Create fun, accurate, unambiguous open-answer trivia questions with one concise accepted answer. Prefer stable facts. Avoid trick wording, disputed claims, current office-holders, multiple choice, and duplicates from the supplied existing list.';

  const context = { category, roundType, difficulty, focus:focus || 'No additional restriction.', count, existing };

  const schema = {
    type:'object',
    properties:{
      items:{
        type:'array', minItems:count, maxItems:count,
        items:{
          type:'object',
          properties:{ question:{type:'string'}, answer:{type:'string'} },
          required:['question','answer'],
          additionalProperties:false
        }
      }
    },
    required:['items'],
    additionalProperties:false
  };

  const prompt = `${systemInstruction}\n\nGenerate exactly ${count} item(s) using this trivia-round context:\n${JSON.stringify(context)}`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const gemini = await fetch(endpoint, {
      method:'POST',
      headers:{ 'x-goog-api-key':apiKey, 'content-type':'application/json' },
      body:JSON.stringify({
        contents:[{ role:'user', parts:[{ text:prompt }] }],
        generationConfig:{
          responseFormat:{ text:{ mimeType:'application/json', schema } }
        }
      })
    });

    const data = await gemini.json().catch(() => ({}));
    if (!gemini.ok) {
      const message = data?.error?.message || `Gemini request failed (${gemini.status}).`;
      console.error('Gemini API error:', message);
      if (/quota|rate limit|resource exhausted/i.test(message)) {
        return json({ error:'Gemini free-tier limit has been reached. Try again later or use Offline Suggestion.' }, 429);
      }
      if (/api key|permission|unauthenticated|forbidden/i.test(message)) {
        return json({ error:'Your Gemini API key is invalid, restricted incorrectly, or not available to this deployment.' }, 502);
      }
      if (/model|not found|unsupported/i.test(message)) {
        return json({ error:`Gemini model ${model} is not available for this API key. Set GEMINI_MODEL to gemini-2.5-flash-lite.` }, 502);
      }
      return json({ error:`Gemini error: ${cleanText(message,240)}` }, 502);
    }

    const outputText = extractText(data);
    if (!outputText) return json({ error:'Gemini returned an empty response.' }, 502);

    let parsed;
    try { parsed = JSON.parse(outputText); }
    catch {
      console.error('Gemini returned unreadable JSON:', outputText.slice(0,500));
      return json({ error:'Gemini returned a response the Trivia Helper could not read.' }, 502);
    }

    const rawItems = Array.isArray(parsed?.items) ? parsed.items : [];
    const items = rawItems.map(item => ({
      question: roundType === 'music' ? '' : cleanText(item?.question, 600),
      answer: cleanText(item?.answer, 300)
    })).filter(item => roundType === 'music' ? item.answer : (item.question && item.answer)).slice(0,count);

    if (!items.length) return json({ error:'Gemini did not return a usable trivia item.' }, 502);
    return json({ items, provider:'gemini', model });
  } catch (error) {
    console.error('Gemini helper connection failure:', error);
    return json({ error:'The Gemini server function could not connect to Google. Offline Suggestion still works.' }, 502);
  }
}

export default { fetch: handle };
export const GET = handle;
export const POST = handle;

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

function parseJsonText(text) {
  if (!text) return null;
  const trimmed = text.trim();
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  try { return JSON.parse(unfenced); } catch {}

  const first = unfenced.indexOf('{');
  const last = unfenced.lastIndexOf('}');
  if (first >= 0 && last > first) {
    try { return JSON.parse(unfenced.slice(first, last + 1)); } catch {}
  }
  return null;
}

async function listAvailableModels(apiKey) {
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000', {
    headers: { 'x-goog-api-key': apiKey, 'accept':'application/json' }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.error?.message || `Unable to list Gemini models (${res.status}).`;
    throw new Error(message);
  }
  return (Array.isArray(data.models) ? data.models : [])
    .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
    .map(m => String(m.name || '').replace(/^models\//,''))
    .filter(Boolean);
}

function chooseModel(available, requested) {
  if (requested && available.includes(requested)) return requested;

  const preferred = [
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash'
  ];
  for (const name of preferred) if (available.includes(name)) return name;

  const flashLite = available.find(x => /gemini.*flash-lite/i.test(x) && !/preview|exp/i.test(x));
  if (flashLite) return flashLite;
  const flash = available.find(x => /gemini.*flash/i.test(x) && !/preview|exp/i.test(x));
  if (flash) return flash;
  return available.find(x => /^gemini-/i.test(x)) || '';
}

async function resolveModel(apiKey) {
  const requested = cleanText(process.env.GEMINI_MODEL, 100);
  const available = await listAvailableModels(apiKey);
  return { model: chooseModel(available, requested), available, requested };
}

async function handle(request) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (request.method === 'GET') {
    if (!apiKey) return json({ ok:true, configured:false, service:'Gemini Trivia Helper' });
    try {
      const resolved = await resolveModel(apiKey);
      return json({
        ok:true,
        configured:true,
        service:'Gemini Trivia Helper',
        model:resolved.model || null,
        requestedModel:resolved.requested || null,
        availableModels:resolved.available.filter(x => /gemini/i.test(x)).slice(0,30)
      });
    } catch (error) {
      return json({ ok:false, configured:true, error:cleanText(error?.message || error, 300) }, 502);
    }
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
    ? 'You are a professional live trivia music-round producer. Suggest real, recognizable songs matching the category/theme and difficulty. Never invent a song or artist. Avoid duplicates from the supplied existing list. Each item must have an empty question string and an answer formatted exactly as "Song Title — Artist".'
    : 'You are a professional pub-trivia question writer. Create fun, accurate, unambiguous open-answer trivia questions with one concise accepted answer. Prefer stable facts. Avoid trick wording, disputed claims, current office-holders, multiple choice, and duplicates from the supplied existing list.';

  const context = { category, roundType, difficulty, focus:focus || 'No additional restriction.', count, existing };
  const prompt = `${systemInstruction}\n\nGenerate exactly ${count} item(s) using this trivia-round context:\n${JSON.stringify(context)}\n\nReturn ONLY valid JSON with exactly this shape and no markdown fences:\n{"items":[{"question":"...","answer":"..."}]}`;

  try {
    const resolved = await resolveModel(apiKey);
    const model = resolved.model;
    if (!model) {
      return json({ error:'No Gemini model that supports text generation is available for this API key. Open Google AI Studio with this same key/project and enable Gemini API access, then try again.' }, 502);
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const gemini = await fetch(endpoint, {
      method:'POST',
      headers:{ 'x-goog-api-key':apiKey, 'content-type':'application/json' },
      body:JSON.stringify({
        contents:[{ role:'user', parts:[{ text:prompt }] }]
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
      return json({ error:`Gemini error (${model}): ${cleanText(message,240)}` }, 502);
    }

    const outputText = extractText(data);
    if (!outputText) return json({ error:`Gemini (${model}) returned an empty response.` }, 502);

    const parsed = parseJsonText(outputText);
    if (!parsed) {
      console.error('Gemini returned unreadable JSON:', outputText.slice(0,500));
      return json({ error:'Gemini returned a response the Trivia Helper could not read. Please click Generate again.' }, 502);
    }

    const rawItems = Array.isArray(parsed?.items) ? parsed.items : [];
    const items = rawItems.map(item => ({
      question: roundType === 'music' ? '' : cleanText(item?.question, 600),
      answer: cleanText(item?.answer, 300)
    })).filter(item => roundType === 'music' ? item.answer : (item.question && item.answer)).slice(0,count);

    if (!items.length) return json({ error:'Gemini did not return a usable trivia item. Please try again.' }, 502);
    return json({ items, provider:'gemini', model });
  } catch (error) {
    console.error('Gemini helper connection failure:', error);
    return json({ error:`Gemini connection failed: ${cleanText(error?.message || error,240)}` }, 502);
  }
}

export default { fetch: handle };
export const GET = handle;
export const POST = handle;

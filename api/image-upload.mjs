import { put } from '@vercel/blob';

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  },
});

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

function safeSegment(value, fallback = 'image') {
  return String(value || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72) || fallback;
}

async function handle(request) {
  if (request.method === 'GET') {
    return json({
      ok: true,
      configured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      service: 'Trivia Night Cloud Images',
    });
  }

  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return json({
      error: 'Vercel Blob is not connected yet. In Vercel, create/connect a public Blob store to this project, then redeploy.'
    }, 503);
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'The image upload could not be read.' }, 400);
  }

  const file = form.get('file');
  if (!file || typeof file.arrayBuffer !== 'function') return json({ error: 'No image file was received.' }, 400);

  const type = String(file.type || '').toLowerCase();
  if (!ALLOWED_TYPES.has(type)) return json({ error: 'Only JPG, PNG, and WEBP images are allowed.' }, 415);
  if (!file.size || file.size > MAX_UPLOAD_BYTES) return json({ error: 'That image is too large after processing. Please use a smaller image.' }, 413);

  const gameId = safeSegment(form.get('gameId'), 'game');
  const purpose = safeSegment(form.get('purpose'), 'image');
  const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const pathname = `trivia/${gameId}/${purpose}/${Date.now()}-${id}.jpg`;

  try {
    const blob = await put(pathname, file, { access: 'public' });
    return json({
      ok: true,
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType || type,
      size: file.size,
    });
  } catch (error) {
    console.error('Vercel Blob upload failed:', error);
    return json({ error: 'Vercel Blob could not store that image. Check the Blob store connection and try again.' }, 502);
  }
}

export default { fetch: handle };
export const GET = handle;
export const POST = handle;

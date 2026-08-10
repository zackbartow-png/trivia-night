# Trivia Night

A browser-based trivia manager and projector presenter.

## Game format

- 7 categories
- 10 questions/songs per category
- Any category can be a standard trivia round or external-audio Music Round
- Optional 1-question Bonus Round
- Category intro → Questions 1–10 → Pass Your Papers → Answers 1–10
- Music is played separately from the host's phone/Bluetooth speaker

## Gemini Trivia Helper

The editor includes two helper modes:

1. **Gemini Helper** — generates category-aware questions or song ideas, supports Easy/Medium/Hard/Mixed difficulty, custom directions, and can fill all empty slots in a round.
2. **Offline Suggestion** — the built-in question/song bank; works without internet or an API key.

The Gemini Helper requires the site to be hosted with the included `/api/ai-helper` Vercel Function.

### Get a Gemini API key

1. Open Google AI Studio.
2. Create an API key for a Google Cloud project.
3. Restrict the key to the Gemini API where available.
4. Do not paste the key into `app.js`, `index.html`, or any other browser-delivered file.

### Vercel setup

Add this environment variable in your Vercel project settings:

- `GEMINI_API_KEY` — your Gemini Developer API key

Optional:

- `GEMINI_MODEL` — defaults to `gemini-3.5-flash-lite`

`GOOGLE_API_KEY` is also accepted as a fallback, but `GEMINI_API_KEY` is recommended for clarity.

### Local files

If you open `index.html` directly from the ZIP, the Offline Suggestion helper still works. The Gemini buttons require a hosted/server environment because the API key must remain server-side.

## Files

- `index.html` — manager
- `app.js` — manager/game logic
- `play.html` — presenter
- `play.js` — presenter logic
- `styles.css` — visual design
- `api/ai-helper.mjs` — secure server-side Gemini helper endpoint

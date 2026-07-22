# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

Two apps in one repo, deployed separately:

- **`backend/`** — Express + MongoDB (Mongoose 7). Deployed to **Vercel serverless** at `memoriiiz.vercel.app`.
- **`memoriiiz/`** — React 18 CRA frontend. Deployed to **Netlify** at `memorriiiz.netlify.app` (three-r typo is intentional — that's the actual domain).

There is **no monorepo tooling** (no workspaces, no turbo, no nx). Each app has its own `package.json`, `node_modules`, and `.env`. Always run commands from inside the respective directory.

## Common commands

**Frontend (from `memoriiiz/`)**
```bash
npm start           # dev server on port 3000 (or the next free port)
npm run build       # production build to memoriiiz/build/
npm test            # CRA test runner (no meaningful tests exist yet)
```

**Backend (from `backend/`)**
```bash
npm start                                    # nodemon on api/index.js, port from PORT env or 3001 default (we typically use 5000)
node scripts/importGreWords.js [path]        # bulk-import GRE words from a .txt file into Mongo (upsert, idempotent)
node scripts/verifyGreWords.js [path]        # verify every word in a .txt file exists in the DB
```

## Backend architecture

### Entry point is `api/index.js`, not `index.js`

The file lives at `backend/api/index.js` because Vercel treats files in `api/` as filesystem-routed serverless functions. `backend/vercel.json` uses the **modern `functions` block** (with `maxDuration: 60`) — not legacy `builds`. If you switch to `builds`, Vercel silently ignores `maxDuration` and every AI call will die at the 10s hard cap. Don't do it.

The file exports `module.exports = app` for Vercel to invoke per-request, and only calls `app.listen()` when `!process.env.VERCEL` so it also works locally.

### DNS patch for local MongoDB Atlas access

`api/index.js` monkey-patches `dns.lookup` to route through Google/Cloudflare public DNS, but **only when `!process.env.VERCEL`**. This works around home routers (like the user's) that can't resolve MongoDB Atlas SRV records. On Vercel, the patch is skipped because it interferes with Vercel's internal resolver and causes cold-start timeouts.

The patch short-circuits `localhost`, IPv4 literals, and IPv6 to avoid infinite lookups.

### Mongoose connection is cached across invocations

Serverless functions cold-start. Naive `mongoose.connect()` per request adds ~2s and blows the timeout. Instead there's an `ensureDb()` promise cache at module scope, kicked off at module load and awaited by a middleware that gates every request. Save this pattern if you add more serverless-safe code.

### LLM provider is pluggable

`backend/controllers/AiController.js` has a `callLLM()` router that picks between three providers via the `LLM_PROVIDER` env var:

- `gemini` (default) — Google, direct REST call, `AQ.` or `AIza` key
- `groq` — OpenAI-compatible at `api.groq.com/openai/v1`, `gsk_` key, LPU-fast
- `opencode` — OpenAI-compatible at `opencode.ai/zen/v1`, `sk-` key (**requires billing enabled** even for free-tagged models — usually not what you want)

Each provider function takes a unified `{systemPrompt, messages, generationConfig, modelType}` shape and internally converts to the provider-specific request. The three provider functions are independent — never share state between them.

**Groq is the current production default.** Ask/generate are both fast (<2s typical), well under Vercel's 60s cap.

### Meaning-field convention

GRE words store their meaning as a single string in the format:

```
"Definition text. Synonyms: a, b. Antonym: c."
```

`memoriiiz/src/utils/parseMeaning.js` parses this into `{definition, synonyms, antonyms}` and is used by both `FlipCard` (GRE cards) and `ParagraphView` (word tooltips). Any code that displays word details should go through `parseMeaning` for graceful fallback on old records that don't follow the format.

### Paragraph history stores snapshots

`ParagraphModel` embeds `{wordId, word, meaning}` per word rather than a live ref. Historical paragraphs keep their original word text/meaning even if the underlying `Word` doc is later edited or deleted. This is intentional.

## Frontend architecture

### Backend URL is env-configurable

Every axios call uses:
```js
const API_BASE = process.env.REACT_APP_URI || "https://memoriiiz.vercel.app/api";
```
Set `REACT_APP_URI` in `memoriiiz/.env` for local dev (e.g. `http://localhost:5000/api`). CRA reads `.env` only at boot — always restart `npm start` after editing.

### `ParagraphView` is the reusable paragraph display

`memoriiiz/src/components/paragraph/ParagraphView.js` is shared between the Practice generate page and PracticeDetail (viewing a saved paragraph). It handles highlighting, TTS, copy, and the word tooltips with "I know this word" action. Any change to paragraph display UX should happen here, not in the page components.

### Word status flow

Marking a word "Known" (from the tooltip button or the GRE flip-card) sets `status: "Known"` on the Word doc. The paragraph generator queries `{status: "To Learn", type: "GRE"}` via Mongo `$sample`, so Known words automatically drop out of future generations. Same status is used by the GRE page's filter toggle.

### PDF export

`memoriiiz/src/utils/generateParagraphPdf.js` uses `jspdf` client-side. Format is fixed: bold target words with superscript reference numbers, followed by a numbered glossary section (definition + green synonyms + red antonyms). Interactive PDF tooltips were considered but skipped — most viewers don't render them reliably.

## Environment variables

**Backend (`backend/.env`, gitignored):**
- `PORT` (default 3001, we use 5000)
- `GEMINI_API_KEY` — for LLM_PROVIDER=gemini
- `GROQ_API_KEY` — for LLM_PROVIDER=groq
- `OPENCODE_API_KEY` — for LLM_PROVIDER=opencode
- `LLM_PROVIDER` — `gemini` | `groq` | `opencode`
- `VERCEL` — set automatically by Vercel; used to skip the DNS patch

**Frontend (`memoriiiz/.env`, gitignored):**
- `REACT_APP_URI` — backend base URL including `/api`

Same env vars must be duplicated in the Vercel/Netlify dashboards for production.

## MongoDB credentials

Currently hardcoded in `backend/api/index.js` and `backend/scripts/importGreWords.js`. Known tech debt — leaves creds in git history. If rotating, update **both** files.

## Deployment notes

- **Vercel Hobby tier caps at 60s max function duration**, only if configured via the modern `functions` block. The `maxDuration` value in `vercel.json` is load-bearing.
- Both apps auto-deploy on push to `master`. Frontend on Netlify, backend on Vercel.
- If the frontend's API calls suddenly break in prod but work locally, first check whether `REACT_APP_URI` on the deploy platform points to the current backend URL.

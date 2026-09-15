# Promptly

A PWA for practicing how to actually talk to AI — not trivia about prompting, live
practice with feedback. Six tracks (coding, design, writing, research, business,
everyday tasks), a sandbox for freeform experimentation across multiple AI providers,
and a task coach for one-off help outside the structured tracks.

## What's actually in here

- **Tracks & scenarios** — short, scored exercises per domain (`src/lib/scenarios/`).
  Each scenario checks specific things a good prompt should include and gives concrete
  feedback on what's missing, not just a score.
- **Sandbox** — a freeform chat surface with a real multi-provider AI backend
  (`src/lib/providers/`): Groq and Gemini currently wired in, each supporting two
  API keys so a rate limit on one account falls back to the next automatically.
  Supports a single persona (Coach, Plain, Critic, Rewriter) or a Critic → Rewriter
  pipeline where two agents run in sequence on the same input.
- **Local model option** — WebLLM running fully in-browser, no server round-trip,
  for anyone who'd rather not send prompts to a cloud API at all.
- **Streaks & progress** — real local + server-synced tracking (`src/lib/streaks.ts`,
  `prisma/schema.prisma`), not a cosmetic counter.
- **Accounts** — anonymous by default (no signup required to use the app), with
  optional Google or email/password sign-in via NextAuth that attaches to the same
  anonymous identity rather than starting a second one.
- **Voice input / read-aloud** — Web Speech API, no key required.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind 4 · Prisma + Postgres (Neon) ·
NextAuth v5 · WebLLM · framer-motion · Phosphor icons.

## Running locally

```bash
npm install
cp .env.example .env
# fill in DATABASE_URL, AUTH_SECRET, and at least one AI provider key
npm run dev
```

See `.env.example` for the full list of environment variables and what each one does.
`DATABASE_URL` and `AUTH_SECRET` are required for the app to build/run at all; AI
provider keys and Google OAuth credentials are optional — the app degrades gracefully
without them (Auto mode just skips unconfigured providers, Google sign-in is hidden
without its keys set).

## Project state & decisions

See `PROJECT_PLAN.md` for the current architecture, what's locked in vs. still open,
and the live database/deployment state. Read it before touching auth, the database
schema, or the AI provider system.

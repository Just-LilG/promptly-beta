# PROMPTLY — PROJECT PLAN & STATE

**Read this file FIRST, before making any architectural decision.** This project has been
worked on by multiple separate AI sessions with no shared memory of each other. That has
already caused real problems — a database provider silently reverted from Postgres back to
SQLite, a stale migration file reappeared, a duplicate Neon project got created. This
document exists to stop that from happening again.

If you are an AI assistant picking up this project: read this whole file before touching
code, especially before touching `prisma/schema.prisma`, the database, or auth. Update the
relevant section below whenever you make a decision that future sessions need to know about.
Treat "I don't know what a previous session did" as a reason to re-read this file and check
the live database/deployment directly — never as a reason to guess or revert to a default.

---

## 1. Locked decisions — do not silently change these

These are settled. Changing any of them is a real architectural decision that needs to be
deliberate and documented here, not an accidental side effect of starting from an old
checkpoint.

- **Database: Postgres, hosted on Neon.** NOT SQLite. `prisma/schema.prisma` must have
  `provider = "postgresql"`. If you ever find it set to `"sqlite"`, that is drift from an
  outdated checkpoint — fix it back to `"postgresql"`, do not "helpfully" keep SQLite because
  it's simpler to run locally.
- **Neon project in use: `shy-wildflower-98939074`** (name "Promtly" — typo is real, not a
  copy error, cosmetic only). This is the ONE project whose connection string is in Vercel's
  `DATABASE_URL`. There is a second, duplicate, empty Neon project
  (`spring-shadow-94114449`) from an early double-click during account setup — it is unused
  and can be deleted whenever, but is NOT the active one. Never assume "a Neon project named
  Promtly" is unambiguous — check the project ID.
- **Hosting: Vercel.** Serverless — no persistent disk, no long-running processes. This is
  why the database can't be SQLite-on-disk (see `src/lib/db.ts`'s comment).
- **AI providers are pluggable, multi-provider, with key rotation.** See `src/lib/providers/`.
  `PROVIDERS` in `registry.ts` is the fallback order for "Auto" mode. Each provider supports
  up to 2 API keys (two free-tier accounts) via `envKeys: [KEY_1, KEY_2]`. Currently wired:
  **Groq** (primary, `openai/gpt-oss-20b` model) and **Gemini** (fallback). The user
  (Godbless) intends to add more free-tier providers over time: OpenRouter, GitHub Models,
  Mistral, Cohere, Cloudflare Workers AI, Hugging Face — each with two accounts/keys. When
  adding a new provider, follow the exact pattern in `groq.ts` (OpenAI-compatible providers
  are a near copy-paste) and register it in `registry.ts`. Do not invent a different
  multi-provider architecture — this one already works and is tested.
- **User identity model: anonymous-first.** Every user gets a row in `User` via an anonymous
  cookie (`src/lib/user-session.ts`, cookie name `promptly_uid`) the moment they use the app —
  no signup required. Real accounts (see open question in §3) attach ON TOP of that same row;
  they must never create a second, disconneted identity for someone who was already using the
  app anonymously.
- **Local engine (WebLLM) and Cloud engine (server API providers) are both first-class.**
  Sandbox lets the user pick either. Don't remove the local/in-browser option when working on
  the cloud-provider system, or vice versa.
- **User-to-user group chat ("Send") — REOPENED 2026-09-14, full UI built.** Was parked
  earlier the same day; Jadon (the user) explicitly asked to start it, then asked for the full
  interface (bubbles, menu, input, animations). **Built:**
  - `src/components/send-fab.tsx` — circular teal FAB beside the bottom tab bar (mobile only),
    routes to `/send`.
  - `src/lib/send-mock-data.ts` — MOCK room/participants/messages. Explicitly labeled mock;
    swap for real API calls when the backend exists. Shape (`MockMessage`, `MockSender`)
    is meant to survive that swap.
  - `src/components/send-client.tsx` — the full chat screen: WhatsApp-style grouped bubbles
    reusing the real `.chat-bubble`/`chat-bubble-user`/`chat-bubble-ai` tail CSS, per-sender
    tint colors (derived from `--accent` via `color-mix`, not a separate palette), day
    separators, reply-to previews, a long-press/right-click action menu per bubble (Copy /
    Reply / Delete-if-mine) built the same way as `message-actions.tsx`, a composer that
    mirrors Sandbox's (rounded card, focus ring, avatar/attach/send affordances), the same
    fly-to-chat send animation as Sandbox (`@keyframes fly-to-chat`), a typing indicator, and
    a HistoryPanel-style full-screen members/room-info slide-up that explicitly discloses
    "messages here aren't saved or sent to real people yet."
  - `src/app/globals.css` — `.chat-bubble-ai::after` (the tail) now reads
    `var(--chat-bubble-ai-tint, var(--surface))` instead of a hardcoded surface color, so
    Send's tinted bubbles get a matching tail. Backward compatible: Sandbox never sets that
    var, so its bubbles are pixel-identical to before.
  - `src/app/send/page.tsx`, `src/app/send/loading.tsx` — route wrapper.
  **Still not built:** any real backend — Neon message storage, signed-in posting, a
  live-or-poll wire, moderation. The mock "auto-reply" timer in `send-client.tsx` is clearly a
  local `setTimeout`, not a live connection — don't mistake it for one when picking this back
  up. Not placed in `primaryNavItems` (nav.ts) — intentionally separate from the 4-tab bar.
- **Theme is a phone setting, stored locally (2026-09-14).** `promptly:theme` is
  `light` | `dark` | `system`. CSS uses `html[data-theme]`. Do not invent a
  second theme system or put theme in Neon.
- **Notifications are on-device for now (2026-09-14).** Home bell opens `/notifications`
  (inbox only, with Clear inbox). Phone-alert permission and streak-alert toggles live at
  `/settings/notifications`. Prefs and inbox stay in `localStorage`
  (`promptly:notify-prefs`, `promptly:notify-inbox`, `promptly:notify-dismissed`). There is no web-push server, no
  VAPID keys, and no Neon table for this. Do not add a push vendor unless
  Jadon asks. iPhone alerts only work after Add to Home Screen.
- **App mark:** teal head + chat-bubble. In-app `BrandMark` uses
  `public/brand/promptly-mark.svg` (sharp at any size; chat hole is a real cutout,
  not painted black). `public/brand/promptly-mark.png` is a transparent 1024px
  fallback. Home-screen icons in `public/icons/` are separate. Do not swap it
  back to the generic Sparkle square unless the user asks.
- **Sandbox attachments stay in the request, not on disk.** Users can attach images, PDFs, and
  text files in Sandbox (paperclip on a phone, drag-and-drop on a computer). Files are resized
  and capped in the browser (~3 MB each, 4 at a time) then sent with `/api/chat`. Vercel has
  no lasting disk, so binaries are not stored in Neon or localStorage — history keeps
  filenames only. Pictures and PDFs are visible to Gemini; Groq's current model is text-only,
  so Auto puts Gemini first when those files are attached. Local/WebLLM cannot see images.

## 2. Current live state (verify before trusting this — it can go stale)

As of the last verified check:

- **Neon `shy-wildflower-98939074`** has 8 tables: `User`, `Onboarding`, `Streak`,
  `Conversation`, `Message`, `Progress`, `Workflow`, `TaskEvaluation`. All created via raw SQL
  run directly against the database (NOT via `prisma migrate`, because this sandbox/dev
  environment cannot reach `binaries.prisma.sh` to run Prisma CLI commands against a real
  DB). **Prisma's own migration history table does NOT know about this** — if a future
  session runs `prisma migrate dev` against this database, Prisma will try to create these 8
  tables again from scratch and fail because they already exist. Before running any Prisma
  migration command against production, either (a) baseline it properly
  (`prisma migrate resolve --applied <name>`), or (b) keep applying schema changes as raw SQL
  the same way, and update this file with what changed.
- **Vercel env vars believed set:** `DATABASE_URL` (Neon connection string for
  `shy-wildflower-98939074`), `GEMINI_API_KEY`, `GEMINI_API_KEY_2`, `GROQ_API_KEY`,
  `GROQ_API_KEY_2`, `ANTHROPIC_API_KEY`, `AUTH_SECRET`. **`AUTH_SECRET` confirmed SET in Vercel
  as of 2026-09-14** (user confirmed directly — resolves the earlier missing-as-of-2026-09-13
  flag). Still unconfirmed: `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — don't assume Google
  sign-in works until checked.
- **Auth (Google + email/password via NextAuth v5) — CONFIRMED KEPT, wiring completed this
  session.** `Account`, `Session`, `VerificationToken` tables and the new `User` columns
  (`email`, `emailVerified`, `name`, `image`, `password`) now exist in the live Neon database
  (added via raw SQL, additive only — no existing data touched). Schema and `db.ts` fixed
  back to `postgresql` (see §1). **`AUTH_SECRET` must be set in Vercel before deploying** —
  NextAuth v5 requires it in production and Next.js needs it at BUILD time too (prerendering
  happens at build, not just at runtime), so a missing `AUTH_SECRET` can fail the Vercel build
  itself, not just runtime sign-in. Generate one with `openssl rand -base64 32`. Google
  sign-in additionally needs `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — without those, Google
  sign-in specifically will fail, but this should not block anonymous use or email/password
  sign-in (verify this assumption if touching auth further — it was not exhaustively tested
  end-to-end this session, since a full `next build` could not be run in the dev sandbox that
  did this work — see note below).
- **Groq model in use: `openai/gpt-oss-20b`.** NOT `llama-3.3-70b-versatile` —
  that model was moved to Groq's Enterprise-only tier and 400s on a free-tier key. If you see
  that model name anywhere, it's stale/wrong.

## 3. Open questions — resolve with the user before assuming an answer

- **Does the user actually want real accounts (Google/email login), or should the app stay
  anonymous-only?** RESOLVED 2026-09-12: yes, keep it. Database is wired. Not yet
  independently verified: a real signup → login → data-persists-across-session round trip
  (blocked by this dev sandbox being unable to reach Prisma's binary CDN to run a full
  `next build`/`prisma generate` against a real engine — see below). Test this for real after
  the next deploy.
- **Prisma CLI cannot be run in the sandbox used for this work.**
  `binaries.prisma.sh` is outside its network allowlist, so `prisma generate`,
  `prisma migrate dev`, etc. fail with a 403 regardless of `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING`.
  This means schema/migration changes made in that environment could be verified by ESLint and
  manual review, but NOT by an actual `next build` or a real Prisma-client-backed type-check.
  Whoever runs the next real build (Vercel, or a local machine with unrestricted internet) is
  the first real end-to-end verification these auth changes get. Watch that build closely.
- **Which provider is next after Groq + Gemini?** User wants all of: OpenRouter, GitHub
  Models, Mistral, Cohere, Cloudflare Workers AI, Hugging Face — each with 2 keys. No
  particular order was locked in; ask or pick the next-easiest (OpenAI-compatible ones first:
  OpenRouter, GitHub Models, Mistral).
- **In-app group chat for users?** RESOLVED 2026-09-14: hold. Finish the prompting-practice
  product first. Do not start it in a later session unless Jadon explicitly reopens it.

## 4. Patterns to follow (established the hard way — don't reinvent these)

- **Any page that reads auth session state (`useSession()`):** two things are
  required together, or the Vercel build crashes with
  `Cannot destructure property 'data' of useSession(...) as it is undefined`:
  1. `<SessionProvider>` (see `src/components/auth-session-provider.tsx`) must wrap the app —
     it's mounted once in `src/app/layout.tsx`. Don't remove it.
  2. The page itself must NOT be statically prerendered, since a session only exists at
     request time (it depends on cookies). `export const dynamic = "force-dynamic"` cannot be
     exported from a `"use client"` file — the working pattern is a thin server-component
     `page.tsx` that sets `dynamic = "force-dynamic"` and renders a separate
     `"use client"` component that actually calls `useSession()` (see `src/app/account/page.tsx`
     + `src/components/account-client.tsx` for the reference implementation). Home (`src/app/page.tsx`
     + `src/components/home-client.tsx`) and Account (`src/app/account/page.tsx` +
     `AccountClient`) follow the same split. Don't put `useSession()` directly in a page.tsx.
- **Home greeting names:** guests get a sticky browser-only handle like `user12`
  (`localStorage` key `promptly:guest-handle`). This is NOT a new identity and is NOT stored
  in Neon. After login, Home's continue card shows a time-of-day greeting plus the account
  first name (or email local-part). The top-bar picture is a DiceBear avatar by default
  (`ProfileAvatar` → `UserAvatar`) and links to `/account`. Do not invent a second user table or
  replace the anonymous `promptly_uid` cookie with this label.
- **Track icons** use the app green (`bg-accent-soft` / `text-accent`) only. Do not give each
  domain its own rainbow color. That reads as a generic template.
- **Profile pictures:** default faces come from the DiceBear HTTP API
  (`https://api.dicebear.com/10.x/<style>/svg?seed=...`). Style + seed (or a small uploaded
  JPEG data URL) is stored in `localStorage` (`promptly:avatar`) and, when we have a user row,
  in the existing `User.image` column. No new table, no files on disk (Vercel has none).
  Do not add `@dicebear/core` unless we later self-host; the HTTP API is enough. Uploads are
  resized in the browser and capped so they fit in `User.image`.
- **Account name + password:** signed-in users edit `User.name` and change (or set)
  `User.password` from `/account`. Forgot-password uses the existing `VerificationToken`
  table (`identifier` = `reset:email`). Optional `RESEND_API_KEY` sends the email; if it is
  missing, the reset URL is only written to server logs. Do not add a second users table.
- **Levels are real completion counts**, not dummy copy. `src/lib/levels.ts` maps how many
  scenarios you have finished to labels (Just starting → First Steps at 1 → Building Habits
  at 10, and so on). The sidebar meter and `/progress` both use this. Day streak on Progress
  comes from `getDisplayStreak()`, never a hardcoded number. Do not put fake "Level 2 / 42%"
  back in the sidebar.
- **Navigation rooms:** phone tabs stay Home / Learn / Sandbox / Account.
  Language, phone alerts, and appearance live under Settings (gear on
  Profile). The Home bell is the inbox. The Account tab is the profile. Tracks stay on Home (carousel +
  See all) and in the desktop sidebar. Progress and Bring-your-own-task sit on
  Home. Extra tools (Prompt library, Quick challenges, Compare, Reference,
  Workflows) preview on Home as a four-tile shelf and list in full at `/tools`.
  Old `/more` redirects to `/tools`. Desktop sidebar is Home, Learn, Tracks,
  Sandbox, Progress, Library, Task coach, Tools. Do not put Tracks back on the
  phone tab bar unless the user asks. Do not resurrect a More tab.
- **After a scenario score:** show the first missed habit as "Try this next", keep Edit &
  retry, and name the next scenario (or send them to `/tracks` if that was the last one).

- **Any optional integration that depends on env vars not always being set** (Google OAuth,
  an AI provider key, etc.): gate the UI on whether it's actually configured, don't render an
  always-on button/control that fails when clicked. See `src/lib/auth-config.ts` +
  how `/login` and `/signup` pass `googleEnabled` down as a prop — same pattern used for AI
  providers via `/api/providers`. This was a real bug found during a 2026-09-12 audit (see §5)
  — the Google button rendered unconditionally regardless of whether it was configured.

## 5. "Doesn't look AI-generated" audit (2026-09-12)

Researched current tells for AI-generated/vibe-coded apps and audited this codebase against
them. Findings, so this doesn't get re-litigated from scratch later:

**Already clean, no action needed:** no purple/blue gradient headline (the single most common
visual tell); native system-font stack, not Geist/Inter (the two fonts most associated with
AI page builders); no shadcn/ui component fingerprint; no colored left-edge accent bars on
cards; comments explain reasoning, not mechanics (avoids the most-cited code-level tell);
spacing/padding is a deliberate custom scale, not generous AI-default whitespace.

**Fixed this session:**
- `README.md` was the untouched `create-next-app` boilerplate (mentioned Geist, a font this
  project doesn't even use) — this was the single biggest tell in the whole project, since
  it's the first thing anyone sees on GitHub. Replaced with a real description of what the
  app does.
- The "Continue with Google" button on `/login` and `/signup` was unconditional — it rendered
  and was clickable even when `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` weren't configured,
  meaning a user could click it and hit a confusing error. Now gated server-side via
  `src/lib/auth-config.ts`'s `isGoogleAuthConfigured()`, passed down from the `/login` and
  `/signup` server-component wrappers as a prop. This was a real bug, not just cosmetic.
- Lightly varied a handful of repetitive comment phrasings ("X, so the Y" / "rather than Z"
  showing up near-verbatim across many files) — not because any individual comment was bad,
  but because that exact uniformity across a whole codebase is itself a cited tell (different
  contributors/sessions naturally vary phrasing; one consistent voice across everything reads
  as one writer/model). Did NOT do an exhaustive rewrite — diminishing returns past a light
  pass, and comments aren't visible to end users anyway. If this matters more later, a fuller
  pass is still open.

**Not done, worth knowing about if this comes up again:** git commit history pattern (one
giant "initial commit" followed by broad "fixes" commits is itself a cited tell) wasn't
audited — this session didn't have access to the actual git log. Worth checking if someone
raises "does the repo history look right" again.

- **Fixed a real identity-resolution bug (2026-09-12):** `getOrCreateUserId()` in
  `src/lib/user-session.ts` (used by `/api/data`, the sync route) previously read ONLY the
  anonymous `promptly_uid` cookie, with no awareness of an active NextAuth session. Combined
  with `auth.ts`'s `signIn` callback — which merges an anonymous row's data into the
  authenticated user and DELETES the anonymous row on login, but cannot update the cookie
  from inside that callback — this meant: right after logging in, the next sync request would
  find `promptly_uid` pointing at a row that no longer exists, and silently create a fresh,
  empty anonymous user, orphaning the just-logged-in user from their own account for anything
  going through `/api/data`. Fixed: `getOrCreateUserId()` now checks `auth()` first and uses
  the real session's user id when one exists, only falling back to the anonymous cookie when
  there is no session. Verified `session.user.id` typechecks natively (this version's
  `DefaultUser` already includes `id?: string` — no module augmentation needed).

## 6. How to avoid repeating past mistakes

- **Before changing `prisma/schema.prisma` or running any migration:** check §1 and §2 above.
  Check the LIVE database via the Neon connector/MCP tools if available — don't trust a
  schema file's `provider` line without cross-checking, since it has silently reverted before.
- **Before creating a new Neon/Vercel/any-service project:** search for an existing one first.
  A duplicate was created once already from clicking through account setup twice.
- **Before assuming a feature exists or doesn't:** grep the actual codebase. Don't assume
  continuity with "what I remember building" — you may be a different session than whoever
  built the thing you're looking for.
- **When you finish a session of meaningful work:** update this file — lock in new decisions
  under §1, correct §2 to the new live state, resolve or add to §3. A stale plan is worse than
  no plan, so keep this honest rather than exhaustive.

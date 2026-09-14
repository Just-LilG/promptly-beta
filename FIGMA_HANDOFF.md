# Promptly — Figma Design Handoff

## What this app is

A PWA for practicing how to actually talk to AI, live scored practice with real
feedback, not trivia. Six domain tracks, a freeform multi-provider AI sandbox, a
one-off task coach, streaks/progress, and optional accounts on top of an
anonymous-by-default identity.

## Screens (real routes, not a guess)

Primary (bottom tab bar on mobile):
- **Home** (`/`) — continue-card, suggested track, streak
- **Tracks** (`/tracks`) — 6 domain tracks
- **Sandbox** (`/sandbox`) — freeform chat, multi-provider picker, persona/pipeline picker
- **More** (`/more`) — catch-all settings/secondary links

Secondary (reachable via More or in-flow):
- Practice (`/practice`) — general one-off scenarios
- Bring Your Own Task (`/task-coach`)
- Learn (`/learn`) — 7 core habits, `/learn/[slug]` detail
- Compare (`/compare`) — two-prompt side-by-side
- Prompt Library (`/library`)
- My Workflows (`/workflows`) — saved reusable prompts
- Reference (`/reference`)
- Progress (`/progress`) — streak, scores, badges
- Account (`/account`), Login (`/login`), Signup (`/signup`)
- Onboarding (`/onboarding`) — skill level + primary interest, one-time
- Individual track scenario (`/tracks/[slug]/[scenario]`)

## Design tokens (current values, ported as-is or reinterpreted, your call)

**Colors — light mode:**
| Token | Hex | Use |
|---|---|---|
| background | `#fafaf9` | page background |
| surface | `#ffffff` | cards |
| surface-raised | `#ffffff` | popovers/modals |
| foreground | `#16181a` | primary text |
| muted | `#6b7280` | secondary text |
| muted-soft | `#9ca3a4` | tertiary/placeholder |
| border | `#e8e7e4` | dividers, card borders |
| accent | `#0aa87c` | brand green, primary actions |
| accent-soft | `#e3f6ee` | accent-tinted backgrounds |
| accent-foreground | `#ffffff` | text on accent |
| danger | `#d9534f` | errors, failed states |

**Colors — dark mode:**
| Token | Hex |
|---|---|
| background | `#111312` |
| surface | `#1a1d1b` |
| surface-raised | `#202422` |
| foreground | `#f3f4f2` |
| muted | `#9aa09b` |
| muted-soft | `#6f7570` |
| border | `#2a2e2b` |
| accent | `#22c99a` |
| accent-soft | `#163831` |
| accent-foreground | `#0a1512` |
| danger | `#e57a76` |

**Radius scale:** sm `10px` · md `14px` · lg `20px` · pill `999px`

**Typography:** native system font stack (SF Pro on Apple, Segoe UI on Windows) —
no custom webfont currently loaded. Deliberately not Inter/Geist.

**Motion:** framer-motion throughout — spring-based entrances (`[0.34, 1.56, 0.64, 1]`
ease for celebratory/bouncy moments), simple ease-out fades for content, `active:scale-95`
tap feedback on buttons, staggered list entrances.

## Component inventory (build these as reusable Figma components)

- **Card** — base surface container, the single most-reused primitive
- **Bottom tab bar** — 4 primary items, auto-hides on scroll down, reappears on scroll up
- **Sidebar** (desktop) — full nav list
- **Topbar** (mobile) — logo + streak badge
- **Streak badge** — flame icon + count, has an "at risk" visual state
- **Celebration burst** — particle animation for milestones
- **Continue card** — home-screen "resume where you left off" hero card
- **Message actions** — long-press/right-click menu (copy, regenerate, read aloud)
- **Model picker** / **Module picker** — dropdown pickers in Sandbox's input bar
- **History panel** — slide-up conversation history
- **Thinking indicator** — pulsing sparkle trio, replaces generic bouncing dots
- **Chat bubbles** — grouped by sender, squared "tail" corner on the lead bubble of a run
- **Track scenario list** — locked/unlocked/complete states with icon swap
- **Stagger group** — wrapper for staggered list-item entrance animation

## Icon set

Phosphor Icons (not Lucide) — regular and fill weights used contextually
(e.g. filled flame when a streak is active, regular when at zero).

## Voice/tone reference for content

Copy is specific and functional, not generic marketing language. Examples of
the actual tone to match: "Load the AI coach for full feedback on your task,"
"Critic → Rewriter pipeline," "What's missing and why." Avoid vague filler
copy in any new screens Figma designs.

## What to hand Figma alongside this doc

- Actual screenshots of the current build (mobile + desktop) if visual parity matters
- This token table (or a Figma Variables/Styles import if you convert it)
- The screen list above as your page/frame structure
- Explicit ask: are they restyling within these tokens, or proposing a full
  visual redesign? That changes whether they need the hex values at all.

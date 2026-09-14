import { pushStreak } from "@/lib/remote-sync";

const STORAGE_KEY = "promptly:streak";

export type StreakState = {
  current: number;
  longest: number;
  lastActiveDate: string | null; // "YYYY-MM-DD", local calendar day
  totalActiveDays: number;
};

const EMPTY_STATE: StreakState = {
  current: 0,
  longest: 0,
  lastActiveDate: null,
  totalActiveDays: 0,
};

// Local calendar day, not UTC — a streak should follow the user's own day
// boundary, not flip over at some arbitrary UTC midnight while they're still
// awake using the app.
function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const msPerDay = 86_400_000;
  const da = Date.UTC(ay, am - 1, ad);
  const db = Date.UTC(by, bm - 1, bd);
  return Math.round((db - da) / msPerDay);
}

function readState(): StreakState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY_STATE, ...(JSON.parse(raw) as StreakState) } : EMPTY_STATE;
  } catch {
    return EMPTY_STATE;
  }
}

function writeState(state: StreakState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    pushStreak(state);
  } catch {
    // storage unavailable — streak just won't persist across sessions
  }
}

export function getStreakState(): StreakState {
  return readState();
}

// Milestones worth a dedicated celebration. Kept small and meaningful rather
// than every single day — that keeps the moment special instead of routine.
export const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100, 200, 365];

export function isMilestone(streak: number): boolean {
  return STREAK_MILESTONES.includes(streak);
}

export type RecordActivityResult = {
  state: StreakState;
  /** True only on the first activity recorded for today's calendar day. */
  isNewDay: boolean;
  /** True if today's activity advanced the current streak count (vs. just re-confirming an already-counted day). */
  streakIncreased: boolean;
  /** True if the resulting streak count is a milestone worth celebrating. */
  hitMilestone: boolean;
};

// Call this whenever the user completes a unit of real work (finishing a
// scenario, a practice challenge, a task-coach session) — not on every page
// view. This ties the streak to actual usage instead of idle app opens.
export function recordActivity(): RecordActivityResult {
  const prev = readState();
  const today = todayKey();

  if (prev.lastActiveDate === today) {
    // Already counted today — re-confirm without incrementing again.
    return { state: prev, isNewDay: false, streakIncreased: false, hitMilestone: false };
  }

  const gap = prev.lastActiveDate ? daysBetween(prev.lastActiveDate, today) : null;
  // gap === 1 means yesterday, so the streak continues. Any other gap
  // (never active, or a missed day+) starts a fresh streak at 1.
  const nextCurrent = gap === 1 ? prev.current + 1 : 1;
  const nextState: StreakState = {
    current: nextCurrent,
    longest: Math.max(prev.longest, nextCurrent),
    lastActiveDate: today,
    totalActiveDays: prev.totalActiveDays + 1,
  };

  writeState(nextState);

  return {
    state: nextState,
    isNewDay: true,
    streakIncreased: true,
    hitMilestone: isMilestone(nextCurrent),
  };
}

// A streak is only "at risk" (shown with a warning treatment) if the user
// was active yesterday but hasn't yet been active today — i.e. it's still
// alive but will break if today passes with no activity.
export function isStreakAtRisk(state: StreakState): boolean {
  if (state.current === 0 || !state.lastActiveDate) return false;
  const gap = daysBetween(state.lastActiveDate, todayKey());
  return gap >= 1;
}

// A streak that has actually lapsed (gap of 2+ days since last activity)
// should read as broken/reset on next load, even before any new activity
// is recorded — otherwise a stale "12 day streak" keeps showing forever.
export function getDisplayStreak(): StreakState {
  const state = readState();
  if (!state.lastActiveDate) return state;
  const gap = daysBetween(state.lastActiveDate, todayKey());
  if (gap >= 2) {
    return { ...state, current: 0 };
  }
  return state;
}

import { recordActivity, type RecordActivityResult } from "@/lib/streaks";
import { pushProgress } from "@/lib/remote-sync";

const STORAGE_KEY = "promptly:progress";

type TrackProgress = Record<string, { score: number; completedAt: string }>;
type AllProgress = Record<string, TrackProgress>; // trackSlug -> scenarioSlug -> record

function readAll(): AllProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AllProgress) : {};
  } catch {
    return {};
  }
}

function writeAll(data: AllProgress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable — fail silently, progress just won't persist
  }
}

export function getAllProgress(): AllProgress {
  return readAll();
}

export function getTrackProgress(trackSlug: string): TrackProgress {
  return readAll()[trackSlug] ?? {};
}

export function isScenarioComplete(trackSlug: string, scenarioSlug: string): boolean {
  const progress = getTrackProgress(trackSlug);
  return Boolean(progress[scenarioSlug]);
}

export function getCompletedCount(trackSlug: string): number {
  return Object.keys(getTrackProgress(trackSlug)).length;
}

export function markScenarioComplete(
  trackSlug: string,
  scenarioSlug: string,
  score: number
): RecordActivityResult {
  const all = readAll();
  const track = all[trackSlug] ?? {};
  const existing = track[scenarioSlug];
  // Keep the best score across attempts, but always refresh the completion timestamp.
  const bestScore = existing ? Math.max(existing.score, score) : score;
  track[scenarioSlug] = { score: bestScore, completedAt: new Date().toISOString() };
  all[trackSlug] = track;
  writeAll(all);
  pushProgress(trackSlug, scenarioSlug, bestScore, track[scenarioSlug].completedAt);

  // Any real completion counts as a day of activity — this is what actually
  // drives the streak, not just opening the app.
  return recordActivity();
}

// Best score achieved so far for a single scenario, if any attempt has been made.
export function getScenarioBestScore(trackSlug: string, scenarioSlug: string): number | null {
  const track = getTrackProgress(trackSlug);
  return track[scenarioSlug]?.score ?? null;
}

export type LastActivity = {
  trackSlug: string;
  scenarioSlug: string;
  score: number;
  completedAt: string;
};

// Most recently completed scenario across every track, used to power a real
// "continue" card instead of a hardcoded one. Returns null for a fresh user
// with no completions yet.
export function getLastActivity(): LastActivity | null {
  const all = readAll();
  let latest: LastActivity | null = null;

  for (const [trackSlug, track] of Object.entries(all)) {
    for (const [scenarioSlug, record] of Object.entries(track)) {
      if (!latest || record.completedAt > latest.completedAt) {
        latest = { trackSlug, scenarioSlug, score: record.score, completedAt: record.completedAt };
      }
    }
  }

  return latest;
}

// Total scenarios completed across all tracks — a simple, honest number for
// a returning user's overall progress at a glance.
export function getTotalCompletedCount(): number {
  const all = readAll();
  return Object.values(all).reduce((sum, track) => sum + Object.keys(track).length, 0);
}

export function resetTrackProgress(trackSlug: string) {
  const all = readAll();
  delete all[trackSlug];
  writeAll(all);
}

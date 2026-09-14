"use client";

import type { Conversation } from "@/lib/conversations";
import type { OnboardingProfile } from "@/lib/onboarding";
import type { StreakState } from "@/lib/streaks";
import type { Workflow } from "@/lib/workflows";
import type { TaskEvaluation } from "@/lib/task-history";
import { EMPTY_SNAPSHOT, snapshotIsEmpty, type UserDataSnapshot } from "@/lib/data-snapshot";

const KEYS = {
  conversations: "promptly:sandbox-conversations",
  onboarding: "promptly:onboarding-profile",
  streak: "promptly:streak",
  progress: "promptly:progress",
  workflows: "promptly:workflows",
  taskHistory: "promptly:task-coach-history",
} as const;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable
  }
}

function localSnapshot(): UserDataSnapshot {
  return {
    onboarding: readJson<OnboardingProfile | null>(KEYS.onboarding, null),
    streak: readJson<StreakState | null>(KEYS.streak, null),
    conversations: readJson<Conversation[]>(KEYS.conversations, []),
    progress: readJson(KEYS.progress, {}),
    workflows: readJson<Workflow[]>(KEYS.workflows, []),
    taskEvaluations: readJson<TaskEvaluation[]>(KEYS.taskHistory, []),
  };
}

function applySnapshot(data: UserDataSnapshot) {
  if (data.onboarding) writeJson(KEYS.onboarding, data.onboarding);
  if (data.streak) writeJson(KEYS.streak, data.streak);
  writeJson(KEYS.conversations, data.conversations);
  writeJson(KEYS.progress, data.progress);
  writeJson(KEYS.workflows, data.workflows);
  writeJson(KEYS.taskHistory, data.taskEvaluations);
}

async function put(body: unknown) {
  try {
    await fetch("/api/data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // offline — localStorage already has the write
  }
}

let hydratePromise: Promise<void> | null = null;

export function hydrateFromServer(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!hydratePromise) {
    hydratePromise = (async () => {
      try {
        const res = await fetch("/api/data");
        if (!res.ok) return;
        const json = (await res.json()) as { data?: UserDataSnapshot };
        const remote = json.data ?? EMPTY_SNAPSHOT;
        const local = localSnapshot();

        if (snapshotIsEmpty(remote) && !snapshotIsEmpty(local)) {
          await put({ op: "migrate", snapshot: local });
          return;
        }

        if (!snapshotIsEmpty(remote)) {
          applySnapshot(remote);
        }
      } catch {
        // stay on localStorage
      }
    })();
  }
  return hydratePromise;
}

export function pushConversation(conversation: Conversation) {
  void put({ op: "conversation.upsert", conversation });
}

export function pushConversationDelete(id: string) {
  void put({ op: "conversation.delete", id });
}

export function pushOnboarding(profile: OnboardingProfile) {
  void put({ op: "onboarding.save", profile });
}

export function pushStreak(state: StreakState) {
  void put({ op: "streak.save", state });
}

export function pushProgress(
  trackSlug: string,
  scenarioSlug: string,
  score: number,
  completedAt: string
) {
  void put({ op: "progress.upsert", trackSlug, scenarioSlug, score, completedAt });
}

export function pushWorkflow(workflow: Workflow) {
  void put({ op: "workflow.upsert", workflow });
}

export function pushWorkflowDelete(id: string) {
  void put({ op: "workflow.delete", id });
}

export function pushTaskEvaluation(entry: TaskEvaluation) {
  void put({ op: "taskEvaluation.upsert", entry });
}

export function pushTaskEvaluationDelete(id: string) {
  void put({ op: "taskEvaluation.delete", id });
}

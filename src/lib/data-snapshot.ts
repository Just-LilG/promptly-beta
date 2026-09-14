import type { Conversation } from "@/lib/conversations";
import type { OnboardingProfile } from "@/lib/onboarding";
import type { StreakState } from "@/lib/streaks";
import type { Workflow } from "@/lib/workflows";
import type { TaskEvaluation } from "@/lib/task-history";

export type ProgressSnapshot = Record<string, Record<string, { score: number; completedAt: string }>>;

export type UserDataSnapshot = {
  onboarding: OnboardingProfile | null;
  streak: StreakState | null;
  conversations: Conversation[];
  progress: ProgressSnapshot;
  workflows: Workflow[];
  taskEvaluations: TaskEvaluation[];
};

export const EMPTY_SNAPSHOT: UserDataSnapshot = {
  onboarding: null,
  streak: null,
  conversations: [],
  progress: {},
  workflows: [],
  taskEvaluations: [],
};

export function snapshotIsEmpty(data: UserDataSnapshot) {
  return (
    !data.onboarding &&
    !data.streak &&
    data.conversations.length === 0 &&
    Object.keys(data.progress).length === 0 &&
    data.workflows.length === 0 &&
    data.taskEvaluations.length === 0
  );
}

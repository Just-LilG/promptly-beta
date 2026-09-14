import { getOrCreateUserId } from "@/lib/user-session";
import { snapshotIsEmpty, type UserDataSnapshot } from "@/lib/data-snapshot";
import {
  deleteConversation,
  deleteTaskEvaluation,
  deleteWorkflow,
  loadUserSnapshot,
  migrateSnapshot,
  saveOnboarding,
  saveProgress,
  saveStreak,
  upsertConversation,
  upsertTaskEvaluation,
  upsertWorkflow,
} from "@/lib/user-data";
import type { Conversation } from "@/lib/conversations";
import type { OnboardingProfile } from "@/lib/onboarding";
import type { StreakState } from "@/lib/streaks";
import type { Workflow } from "@/lib/workflows";
import type { TaskEvaluation } from "@/lib/task-history";

export const runtime = "nodejs";

export async function GET() {
  try {
    const userId = await getOrCreateUserId();
    const data = await loadUserSnapshot(userId);
    return Response.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load data.";
    return Response.json({ error: message }, { status: 500 });
  }
}

type WriteOp =
  | { op: "migrate"; snapshot: UserDataSnapshot }
  | { op: "conversation.upsert"; conversation: Conversation }
  | { op: "conversation.delete"; id: string }
  | { op: "onboarding.save"; profile: OnboardingProfile }
  | { op: "streak.save"; state: StreakState }
  | {
      op: "progress.upsert";
      trackSlug: string;
      scenarioSlug: string;
      score: number;
      completedAt: string;
    }
  | { op: "workflow.upsert"; workflow: Workflow }
  | { op: "workflow.delete"; id: string }
  | { op: "taskEvaluation.upsert"; entry: TaskEvaluation }
  | { op: "taskEvaluation.delete"; id: string };

export async function PUT(req: Request) {
  let body: WriteOp;
  try {
    body = (await req.json()) as WriteOp;
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const userId = await getOrCreateUserId();

    switch (body.op) {
      case "migrate": {
        const existing = await loadUserSnapshot(userId);
        if (snapshotIsEmpty(existing) && !snapshotIsEmpty(body.snapshot)) {
          await migrateSnapshot(userId, body.snapshot);
        }
        break;
      }
      case "conversation.upsert":
        await upsertConversation(userId, body.conversation);
        break;
      case "conversation.delete":
        await deleteConversation(userId, body.id);
        break;
      case "onboarding.save":
        await saveOnboarding(userId, body.profile);
        break;
      case "streak.save":
        await saveStreak(userId, body.state);
        break;
      case "progress.upsert":
        await saveProgress(
          userId,
          body.trackSlug,
          body.scenarioSlug,
          body.score,
          body.completedAt
        );
        break;
      case "workflow.upsert":
        await upsertWorkflow(userId, body.workflow);
        break;
      case "workflow.delete":
        await deleteWorkflow(userId, body.id);
        break;
      case "taskEvaluation.upsert":
        await upsertTaskEvaluation(userId, body.entry);
        break;
      case "taskEvaluation.delete":
        await deleteTaskEvaluation(userId, body.id);
        break;
      default:
        return Response.json({ error: "Unknown operation." }, { status: 400 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save data.";
    return Response.json({ error: message }, { status: 500 });
  }
}

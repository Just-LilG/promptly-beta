import { prisma } from "@/lib/db";
import type { UserDataSnapshot, ProgressSnapshot } from "@/lib/data-snapshot";
import type { Conversation } from "@/lib/conversations";
import type { OnboardingProfile } from "@/lib/onboarding";
import type { StreakState } from "@/lib/streaks";
import type { Workflow } from "@/lib/workflows";
import type { TaskEvaluation } from "@/lib/task-history";
import type { TaskCoachResult } from "@/lib/task-coach-parser";

export async function loadUserSnapshot(userId: string): Promise<UserDataSnapshot> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      onboarding: true,
      streak: true,
      conversations: {
        include: { messages: { orderBy: { position: "asc" } } },
        orderBy: { updatedAt: "desc" },
      },
      progress: true,
      workflows: { orderBy: { createdAt: "desc" } },
      taskEvaluations: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!user) {
    return {
      onboarding: null,
      streak: null,
      conversations: [],
      progress: {},
      workflows: [],
      taskEvaluations: [],
    };
  }

  const progress: ProgressSnapshot = {};
  for (const row of user.progress) {
    progress[row.trackSlug] ??= {};
    progress[row.trackSlug][row.scenarioSlug] = {
      score: row.score,
      completedAt: row.completedAt.toISOString(),
    };
  }

  return {
    onboarding: user.onboarding
      ? {
          skillLevel: user.onboarding.skillLevel as OnboardingProfile["skillLevel"],
          primaryInterest: user.onboarding.primaryInterest,
          diagnosticScore: user.onboarding.diagnosticScore,
          completedAt: user.onboarding.completedAt.toISOString(),
        }
      : null,
    streak: user.streak
      ? {
          current: user.streak.current,
          longest: user.streak.longest,
          lastActiveDate: user.streak.lastActiveDate,
          totalActiveDays: user.streak.totalActiveDays,
        }
      : null,
    conversations: user.conversations.map(
      (c: {
        id: string;
        title: string;
        updatedAt: Date;
        messages: { role: string; content: string }[];
      }) => ({
        id: c.id,
        title: c.title,
        updatedAt: c.updatedAt.toISOString(),
        messages: c.messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      })
    ),
    progress,
    workflows: user.workflows.map(
      (w: { id: string; name: string; prompt: string; createdAt: Date }) => ({
        id: w.id,
        name: w.name,
        prompt: w.prompt,
        createdAt: w.createdAt.toISOString(),
      })
    ),
    taskEvaluations: user.taskEvaluations.map(
      (e: { id: string; taskText: string; result: string; createdAt: Date }) => ({
        id: e.id,
        taskText: e.taskText,
        result: JSON.parse(e.result) as TaskCoachResult,
        createdAt: e.createdAt.toISOString(),
      })
    ),
  };
}

export async function upsertConversation(userId: string, conversation: Conversation) {
  const ops = [
    prisma.conversation.upsert({
      where: { id: conversation.id },
      create: {
        id: conversation.id,
        userId,
        title: conversation.title,
        updatedAt: new Date(conversation.updatedAt),
      },
      update: {
        title: conversation.title,
        updatedAt: new Date(conversation.updatedAt),
      },
    }),
    prisma.message.deleteMany({ where: { conversationId: conversation.id } }),
  ];
  if (conversation.messages.length > 0) {
    ops.push(
      prisma.message.createMany({
        data: conversation.messages.map((m, position) => ({
          conversationId: conversation.id,
          role: m.role,
          content: m.content,
          position,
        })),
      })
    );
  }
  await prisma.$transaction(ops);
  await prisma.user.update({ where: { id: userId }, data: { updatedAt: new Date() } });
}

export async function deleteConversation(userId: string, id: string) {
  await prisma.conversation.deleteMany({ where: { id, userId } });
}

export async function saveOnboarding(userId: string, profile: OnboardingProfile) {
  await prisma.onboarding.upsert({
    where: { userId },
    create: {
      userId,
      skillLevel: profile.skillLevel,
      primaryInterest: profile.primaryInterest,
      diagnosticScore: profile.diagnosticScore,
      completedAt: new Date(profile.completedAt),
    },
    update: {
      skillLevel: profile.skillLevel,
      primaryInterest: profile.primaryInterest,
      diagnosticScore: profile.diagnosticScore,
      completedAt: new Date(profile.completedAt),
    },
  });
}

export async function saveStreak(userId: string, state: StreakState) {
  await prisma.streak.upsert({
    where: { userId },
    create: {
      userId,
      current: state.current,
      longest: state.longest,
      lastActiveDate: state.lastActiveDate,
      totalActiveDays: state.totalActiveDays,
    },
    update: {
      current: state.current,
      longest: state.longest,
      lastActiveDate: state.lastActiveDate,
      totalActiveDays: state.totalActiveDays,
    },
  });
}

export async function saveProgress(
  userId: string,
  trackSlug: string,
  scenarioSlug: string,
  score: number,
  completedAt: string
) {
  await prisma.progress.upsert({
    where: {
      userId_trackSlug_scenarioSlug: { userId, trackSlug, scenarioSlug },
    },
    create: {
      userId,
      trackSlug,
      scenarioSlug,
      score,
      completedAt: new Date(completedAt),
    },
    update: {
      score,
      completedAt: new Date(completedAt),
    },
  });
}

export async function replaceProgress(userId: string, progress: ProgressSnapshot) {
  await prisma.$transaction([
    prisma.progress.deleteMany({ where: { userId } }),
    prisma.progress.createMany({
      data: Object.entries(progress).flatMap(([trackSlug, scenarios]) =>
        Object.entries(scenarios).map(([scenarioSlug, record]) => ({
          userId,
          trackSlug,
          scenarioSlug,
          score: record.score,
          completedAt: new Date(record.completedAt),
        }))
      ),
    }),
  ]);
}

export async function upsertWorkflow(userId: string, workflow: Workflow) {
  await prisma.workflow.upsert({
    where: { id: workflow.id },
    create: {
      id: workflow.id,
      userId,
      name: workflow.name,
      prompt: workflow.prompt,
      createdAt: new Date(workflow.createdAt),
    },
    update: {
      name: workflow.name,
      prompt: workflow.prompt,
    },
  });
}

export async function deleteWorkflow(userId: string, id: string) {
  await prisma.workflow.deleteMany({ where: { id, userId } });
}

export async function upsertTaskEvaluation(userId: string, entry: TaskEvaluation) {
  await prisma.taskEvaluation.upsert({
    where: { id: entry.id },
    create: {
      id: entry.id,
      userId,
      taskText: entry.taskText,
      result: JSON.stringify(entry.result),
      createdAt: new Date(entry.createdAt),
    },
    update: {
      taskText: entry.taskText,
      result: JSON.stringify(entry.result),
    },
  });
}

export async function deleteTaskEvaluation(userId: string, id: string) {
  await prisma.taskEvaluation.deleteMany({ where: { id, userId } });
}

export async function migrateSnapshot(userId: string, snapshot: UserDataSnapshot) {
  if (snapshot.onboarding) await saveOnboarding(userId, snapshot.onboarding);
  if (snapshot.streak) await saveStreak(userId, snapshot.streak);
  for (const conversation of snapshot.conversations) {
    await upsertConversation(userId, conversation);
  }
  if (Object.keys(snapshot.progress).length > 0) {
    await replaceProgress(userId, snapshot.progress);
  }
  for (const workflow of snapshot.workflows) {
    await upsertWorkflow(userId, workflow);
  }
  for (const entry of snapshot.taskEvaluations) {
    await upsertTaskEvaluation(userId, entry);
  }
}

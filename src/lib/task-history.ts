import type { TaskCoachResult } from "@/lib/task-coach-parser";
import { pushTaskEvaluation, pushTaskEvaluationDelete } from "@/lib/remote-sync";

const STORAGE_KEY = "promptly:task-coach-history";
const MAX_ENTRIES = 30;

export type TaskEvaluation = {
  id: string;
  taskText: string;
  result: TaskCoachResult;
  createdAt: string;
};

function readAll(): TaskEvaluation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TaskEvaluation[]) : [];
  } catch {
    return [];
  }
}

function writeAll(entries: TaskEvaluation[]) {
  if (typeof window === "undefined") return;
  try {
    const trimmed = [...entries]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // storage full or unavailable — history just won't persist this session
  }
}

export function listTaskEvaluations(): TaskEvaluation[] {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getTaskEvaluation(id: string): TaskEvaluation | undefined {
  return readAll().find((e) => e.id === id);
}

export function saveTaskEvaluation(taskText: string, result: TaskCoachResult): string {
  const all = readAll();
  const id = `eval_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const entry: TaskEvaluation = { id, taskText, result, createdAt: new Date().toISOString() };
  all.push(entry);
  writeAll(all);
  pushTaskEvaluation(entry);
  return id;
}

export function deleteTaskEvaluation(id: string) {
  const all = readAll();
  writeAll(all.filter((e) => e.id !== id));
  pushTaskEvaluationDelete(id);
}

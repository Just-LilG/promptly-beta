import { pushWorkflow, pushWorkflowDelete } from "@/lib/remote-sync";

const STORAGE_KEY = "promptly:workflows";

export type Workflow = {
  id: string;
  name: string;
  prompt: string;
  createdAt: string;
};

function readAll(): Workflow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Workflow[]) : [];
  } catch {
    return [];
  }
}

function writeAll(workflows: Workflow[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
  } catch {
    // storage unavailable — fail silently
  }
}

export function getWorkflows(): Workflow[] {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveWorkflow(name: string, prompt: string): Workflow {
  const all = readAll();
  const workflow: Workflow = {
    id: `wf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    prompt,
    createdAt: new Date().toISOString(),
  };
  writeAll([...all, workflow]);
  pushWorkflow(workflow);
  return workflow;
}

export function updateWorkflow(id: string, name: string, prompt: string) {
  const all = readAll();
  const updated = all.map((w) => (w.id === id ? { ...w, name, prompt } : w));
  writeAll(updated);
  const next = updated.find((w) => w.id === id);
  if (next) pushWorkflow(next);
}

export function deleteWorkflow(id: string) {
  const all = readAll();
  writeAll(all.filter((w) => w.id !== id));
  pushWorkflowDelete(id);
}

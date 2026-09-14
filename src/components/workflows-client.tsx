"use client";

import { useState } from "react";
import { Plus, Copy, Check, PencilSimple, Trash, X, FlowArrow as WorkflowIcon } from "@/icons";
import { Card } from "@/components/card";
import {
  getWorkflows,
  saveWorkflow,
  updateWorkflow,
  deleteWorkflow,
  type Workflow,
} from "@/lib/workflows";

export function WorkflowsClient() {
  // Lazy-init reads saved workflows during the initial render itself.
  const [workflows, setWorkflows] = useState<Workflow[]>(() =>
    typeof window === "undefined" ? [] : getWorkflows()
  );
  const [editing, setEditing] = useState<Workflow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const openCreate = () => {
    setName("");
    setPrompt("");
    setIsCreating(true);
    setEditing(null);
  };

  const openEdit = (w: Workflow) => {
    setName(w.name);
    setPrompt(w.prompt);
    setEditing(w);
    setIsCreating(false);
  };

  const closeForm = () => {
    setIsCreating(false);
    setEditing(null);
  };

  const handleSave = () => {
    if (!name.trim() || !prompt.trim()) return;
    if (editing) {
      updateWorkflow(editing.id, name.trim(), prompt.trim());
    } else {
      saveWorkflow(name.trim(), prompt.trim());
    }
    setWorkflows(getWorkflows());
    closeForm();
  };

  const handleDelete = (id: string) => {
    deleteWorkflow(id);
    setWorkflows(getWorkflows());
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1800);
    } catch {
      // clipboard unavailable — fail quietly
    }
  };

  const isFormOpen = isCreating || Boolean(editing);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 pt-6 md:pt-10 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">My Workflows</h1>
          <p className="text-muted text-[14px] mt-1.5">
            Save prompt routines you use over and over. Saved on this device.
          </p>
        </div>
      </div>

      {!isFormOpen && (
        <button
          onClick={openCreate}
          className="mt-5 flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-pill)] bg-accent text-accent-foreground text-[13.5px] font-medium active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" />
          New workflow
        </button>
      )}

      {isFormOpen && (
        <Card className="p-4 md:p-5 mt-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-[13.5px] font-semibold">
              {editing ? "Edit workflow" : "New workflow"}
            </p>
            <button onClick={closeForm} aria-label="Close">
              <X className="w-4 h-4 text-muted-soft" />
            </button>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Name, e.g. "Weekly status update"'
            className="rounded-[var(--radius-sm)] bg-background border border-border px-3 py-2.5 text-[14px] outline-none focus:border-accent transition-colors"
          />
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="The prompt itself. Use [brackets] for the parts that change each time"
            rows={5}
            className="rounded-[var(--radius-sm)] bg-background border border-border px-3 py-2.5 text-[14px] leading-relaxed resize-none outline-none focus:border-accent transition-colors"
          />
          <button
            onClick={handleSave}
            disabled={!name.trim() || !prompt.trim()}
            className="self-end px-4 py-2.5 rounded-[var(--radius-pill)] bg-accent text-accent-foreground text-[13.5px] font-medium disabled:opacity-40 active:scale-95 transition-transform"
          >
            {editing ? "Save changes" : "Save workflow"}
          </button>
        </Card>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {workflows.length === 0 && !isFormOpen && (
          <Card className="p-6 text-center flex flex-col items-center gap-2">
            <WorkflowIcon className="w-6 h-6 text-muted-soft" />
            <p className="text-[13.5px] text-muted">
              No workflows saved yet. Create one for a prompt you use regularly.
            </p>
          </Card>
        )}

        {workflows.map((w) => {
          const isCopied = copiedId === w.id;
          return (
            <Card key={w.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[14.5px] font-semibold">{w.name}</p>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(w)}
                    className="p-1.5 text-muted-soft"
                    aria-label="Edit"
                  >
                    <PencilSimple className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(w.id)}
                    className="p-1.5 text-muted-soft"
                    aria-label="Delete"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <pre className="mt-2.5 text-[13px] leading-relaxed whitespace-pre-wrap rounded-[var(--radius-sm)] bg-background border border-border p-3 font-sans">
                {w.prompt}
              </pre>
              <button
                onClick={() => handleCopy(w.id, w.prompt)}
                className={`mt-3 flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-pill)] text-[13px] font-medium transition-colors active:scale-95 ${
                  isCopied ? "bg-accent-soft text-accent" : "bg-background border border-border text-muted"
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

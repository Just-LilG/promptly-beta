"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash, X, ChatCircleText } from "@/icons";
import { Card } from "@/components/card";
import type { Conversation } from "@/lib/conversations";

function groupByRecency(conversations: Conversation[]) {
  const now = new Date();
  const todayStr = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const groups: { label: string; items: Conversation[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Earlier", items: [] },
  ];

  for (const c of conversations) {
    const d = new Date(c.updatedAt).toDateString();
    if (d === todayStr) groups[0].items.push(c);
    else if (d === yesterdayStr) groups[1].items.push(c);
    else groups[2].items.push(c);
  }

  return groups.filter((g) => g.items.length > 0);
}

function lastMessagePreview(c: Conversation): string {
  const last = [...c.messages].reverse().find((m) => m.content.trim());
  if (!last) return "No response yet";
  const text = last.content.trim().replace(/\s+/g, " ");
  const prefix = last.role === "user" ? "You: " : "";
  const combined = prefix + text;
  return combined.length > 60 ? combined.slice(0, 60) + "…" : combined;
}

export function HistoryPanel({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onClose,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const groups = groupByRecency(conversations);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[60] flex flex-col bg-background"
    >
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
        <div>
          <p className="text-[15px] font-semibold">History</p>
          <p className="text-[12px] text-muted mt-0.5">
            {conversations.length} conversation{conversations.length === 1 ? "" : "s"}
          </p>
        </div>
        <button onClick={onClose} className="p-1.5" aria-label="Close">
          <X className="w-5 h-5 text-muted" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {conversations.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center gap-2 text-center pt-16"
          >
            <ChatCircleText className="w-6 h-6 text-muted-soft" />
            <p className="text-[13.5px] text-muted">No past conversations yet.</p>
          </motion.div>
        )}

        {groups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="text-[11.5px] font-semibold text-muted-soft uppercase tracking-wide mb-2 px-0.5">
              {group.label}
            </p>
            <div className="flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {group.items.map((c) => {
                  const isActive = c.id === activeId;
                  return (
                    <motion.div
                      key={c.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0, scale: 0.96 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Card
                        className="p-3.5 flex items-center gap-3 active:scale-[0.99] transition-transform"
                        style={isActive ? { borderColor: "var(--accent)" } : undefined}
                      >
                        <button onClick={() => onSelect(c.id)} className="flex-1 min-w-0 text-left">
                          <div className="flex items-center gap-1.5">
                            <p className="text-[13.5px] font-medium truncate">{c.title}</p>
                            {isActive && (
                              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-accent" />
                            )}
                          </div>
                          <p className="text-[12px] text-muted mt-0.5 truncate">
                            {lastMessagePreview(c)}
                          </p>
                          <p className="text-[11px] text-muted-soft mt-1">
                            {new Date(c.updatedAt).toLocaleTimeString(undefined, {
                              hour: "numeric",
                              minute: "2-digit",
                            })}{" "}
                            · {c.messages.length} msg{c.messages.length === 1 ? "" : "s"}
                          </p>
                        </button>
                        <button
                          onClick={() => onDelete(c.id)}
                          className="p-2 text-muted-soft shrink-0"
                          aria-label="Delete conversation"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

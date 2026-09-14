"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash, X, ClipboardText } from "@/icons";
import { Card } from "@/components/card";
import type { TaskEvaluation } from "@/lib/task-history";

export function TaskHistoryPanel({
  evaluations,
  onSelect,
  onDelete,
  onClose,
}: {
  evaluations: TaskEvaluation[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
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
          <p className="text-[15px] font-semibold">Past evaluations</p>
          <p className="text-[12px] text-muted mt-0.5">
            {evaluations.length} saved
          </p>
        </div>
        <button onClick={onClose} className="p-1.5" aria-label="Close">
          <X className="w-5 h-5 text-muted" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        {evaluations.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center gap-2 text-center pt-16"
          >
            <ClipboardText className="w-6 h-6 text-muted-soft" />
            <p className="text-[13.5px] text-muted">No evaluations yet.</p>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {evaluations.map((e) => {
            const preview = e.taskText.trim().replace(/\s+/g, " ");
            const title = preview.length > 60 ? preview.slice(0, 60) + "…" : preview;
            return (
              <motion.div
                key={e.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0, scale: 0.96 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <Card className="p-3.5 flex items-center gap-3 active:scale-[0.99] transition-transform">
                  <button onClick={() => onSelect(e.id)} className="flex-1 min-w-0 text-left">
                    <p className="text-[13.5px] font-medium truncate">{title}</p>
                    <p className="text-[12px] text-muted mt-0.5 truncate">{e.result.verdict}</p>
                    <p className="text-[11px] text-muted-soft mt-1">
                      {new Date(e.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      ·{" "}
                      {new Date(e.createdAt).toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </button>
                  <button
                    onClick={() => onDelete(e.id)}
                    className="p-2 text-muted-soft shrink-0"
                    aria-label="Delete"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

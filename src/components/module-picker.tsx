"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkle, FlowArrow } from "@/icons";
import { cn } from "@/lib/cn";
import { AGENT_MODULES, type ModuleId } from "@/lib/agent-modules";

export type SelectionMode = { kind: "single"; moduleId: ModuleId } | { kind: "pipeline" };

export function ModulePicker({
  open,
  onClose,
  selection,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  selection: SelectionMode;
  onSelect: (next: SelectionMode) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.94, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -4 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-0 top-full mt-1.5 z-30 w-[min(288px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] rounded-[var(--radius-lg)] bg-surface-raised border border-border card-shadow p-1.5"
        >
          <p className="px-2.5 pt-1.5 pb-1 text-[11px] font-medium text-muted-soft uppercase tracking-wide">
            Single module
          </p>
          {AGENT_MODULES.map((m) => {
            const active = selection.kind === "single" && selection.moduleId === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  onSelect({ kind: "single", moduleId: m.id });
                  onClose();
                }}
                className={cn(
                  "w-full flex items-start gap-2.5 px-2.5 py-2 rounded-[var(--radius-md)] text-left transition-colors",
                  active ? "bg-accent-soft" : "active:bg-background"
                )}
              >
                <div className="w-6 h-6 rounded-[var(--radius-sm)] bg-accent-soft flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkle className="w-3.5 h-3.5 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium">{m.name}</p>
                  <p className="text-[11.5px] text-muted mt-0.5 leading-snug">{m.description}</p>
                </div>
                {active && <Check className="w-4 h-4 text-accent shrink-0 mt-1" />}
              </button>
            );
          })}

          <div className="h-px bg-border my-1.5" />

          <p className="px-2.5 pt-1 pb-1 text-[11px] font-medium text-muted-soft uppercase tracking-wide">
            Multi-agent
          </p>
          <button
            onClick={() => {
              onSelect({ kind: "pipeline" });
              onClose();
            }}
            className={cn(
              "w-full flex items-start gap-2.5 px-2.5 py-2 rounded-[var(--radius-md)] text-left transition-colors",
              selection.kind === "pipeline" ? "bg-accent-soft" : "active:bg-background"
            )}
          >
            <div className="w-6 h-6 rounded-[var(--radius-sm)] bg-accent-soft flex items-center justify-center shrink-0 mt-0.5">
              <FlowArrow className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium">Critic → Rewriter pipeline</p>
              <p className="text-[11.5px] text-muted mt-0.5 leading-snug">
                Two agents run in sequence: Critic finds weaknesses, then Rewriter fixes them.
              </p>
            </div>
            {selection.kind === "pipeline" && <Check className="w-4 h-4 text-accent shrink-0 mt-1" />}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

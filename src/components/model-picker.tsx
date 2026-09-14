"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, MagicWand } from "@/icons";
import { cn } from "@/lib/cn";
import type { ProviderStatus } from "@/lib/use-provider-status";

export function ModelPicker({
  open,
  onClose,
  providers,
  selected,
  onSelect,
  lastProviderUsed,
}: {
  open: boolean;
  onClose: () => void;
  providers: ProviderStatus[] | null;
  selected: string;
  onSelect: (id: string) => void;
  lastProviderUsed: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (ref.current?.contains(target)) return;
      if (target instanceof Element && target.closest("[data-model-picker-trigger]")) return;
      onClose();
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [open, onClose]);

  const configuredProviders = (providers ?? []).filter((p) => p.configured);
  const lastName =
    lastProviderUsed &&
    (providers?.find((p) => p.id === lastProviderUsed)?.name ?? lastProviderUsed);

  const pick = (id: string) => {
    onSelect(id);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="w-full rounded-[var(--radius-lg)] bg-surface-raised border border-border card-shadow p-1.5 mb-1.5"
        >
          <button
            type="button"
            onClick={() => pick("auto")}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] rounded-[var(--radius-md)] text-left",
              selected === "auto" ? "bg-accent-soft" : "active:bg-background"
            )}
          >
            <MagicWand className="w-4 h-4 text-accent shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium">Auto</span>
              <span className="block text-[12.5px] text-muted mt-0.5 leading-snug">
                {configuredProviders.length > 0
                  ? "Try another if one is busy."
                  : "No helpers set up yet."}
                {selected === "auto" && lastName ? ` Last reply: ${lastName}.` : ""}
              </span>
            </span>
            {selected === "auto" ? <Check className="w-4 h-4 text-accent shrink-0" /> : null}
          </button>

          {configuredProviders.map((p) => {
            const active = selected === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => pick(p.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] rounded-[var(--radius-md)] text-left",
                  active ? "bg-accent-soft" : "active:bg-background"
                )}
              >
                <span className="min-w-0 flex-1 text-[14px] font-medium">{p.name}</span>
                {active ? <Check className="w-4 h-4 text-accent shrink-0" /> : null}
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

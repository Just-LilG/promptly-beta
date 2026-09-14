"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Fire, X } from "@/icons";
import { CelebrationBurst } from "@/components/celebration-burst";

const MILESTONE_COPY: Record<number, { title: string; body: string }> = {
  3: { title: "3 days running", body: "The habit is starting to stick. Keep it going." },
  7: { title: "A full week", body: "Seven days straight. That's a real habit now." },
  14: { title: "Two weeks strong", body: "Consistency is starting to compound." },
  30: { title: "A whole month", body: "30 days. This is who you are now." },
  50: { title: "50 days", body: "Most people never get here. You did." },
  100: { title: "100 days", body: "Triple digits. Genuinely rare." },
  200: { title: "200 days", body: "This isn't a streak anymore. It's a habit for life." },
  365: { title: "One full year", body: "Every single day for a year. Remarkable." },
};

export function StreakMilestoneModal({
  streak,
  onClose,
}: {
  streak: number | null;
  onClose: () => void;
}) {
  const copy = streak ? MILESTONE_COPY[streak] : null;

  return (
    <AnimatePresence>
      {streak !== null && copy && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: "color-mix(in srgb, var(--background) 80%, transparent)" }}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative w-full max-w-xs rounded-[var(--radius-lg)] bg-surface-raised border border-border card-shadow p-7 text-center overflow-visible"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-muted-soft active:bg-background"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative flex items-center justify-center mb-1">
              <CelebrationBurst intensity="high" />
              <motion.div
                initial={{ scale: 0.3, rotate: -25 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shrink-0"
              >
                <Fire className="w-8 h-8 text-accent-foreground" weight="fill" />
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
              className="text-[13px] font-medium text-accent mt-3"
            >
              {streak}-day streak
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.3 }}
              className="text-[20px] font-semibold tracking-tight mt-1"
            >
              {copy.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="text-[13.5px] text-muted mt-2 leading-relaxed"
            >
              {copy.body}
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48, duration: 0.3 }}
              onClick={onClose}
              className="mt-6 w-full py-2.5 rounded-[var(--radius-pill)] bg-accent text-accent-foreground text-[13.5px] font-medium active:scale-95 transition-transform"
            >
              Keep going
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Fire } from "@/icons";
import { cn } from "@/lib/cn";
import { getDisplayStreak, isStreakAtRisk, type StreakState } from "@/lib/streaks";

export function StreakBadge({
  size = "sm",
  showLabel = false,
  hideWhenZero = false,
  className,
}: {
  size?: "sm" | "md";
  showLabel?: boolean;
  hideWhenZero?: boolean;
  className?: string;
}) {
  // Lazy-init reads localStorage once on the client during the initial
  // render itself (not in an effect) — that avoids an extra render pass and
  // any flash between a placeholder and the real value.
  const [streak] = useState<StreakState | null>(() =>
    typeof window === "undefined" ? null : getDisplayStreak()
  );
  const reduceMotion = useReducedMotion();

  // Server-rendered (or pre-hydration) — render the loading shell rather
  // than a fixed number that would otherwise flash before the true value
  // is known.
  if (!streak) {
    if (hideWhenZero) return null;
    return (
      <div
        className={cn(
          "rounded-full bg-surface border border-border animate-pulse",
          size === "sm" ? "w-[52px] h-[26px]" : "w-24 h-9",
          className
        )}
      />
    );
  }

  const atRisk = isStreakAtRisk(streak);
  const hasStreak = streak.current > 0;

  if (hideWhenZero && !hasStreak) return null;

  const label = hasStreak
    ? atRisk
      ? `${streak.current} day streak. Practice today to keep it`
      : `${streak.current} day streak`
    : "Complete a scenario to start a streak";

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.34, 1.56, 0.64, 1] }}
      role="status"
      aria-label={label}
      className={cn(
        "flex items-center gap-1.5 rounded-full border",
        size === "sm" ? "px-2.5 py-1" : "px-3.5 py-2",
        atRisk
          ? "border-danger/30"
          : "border-border",
        className
      )}
      style={{
        background: atRisk
          ? "color-mix(in srgb, var(--danger) 8%, var(--surface))"
          : "var(--surface)",
      }}
    >
      <Fire
        className={cn(
          size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4",
          hasStreak ? (atRisk ? "text-danger" : "text-accent") : "text-muted-soft"
        )}
        weight={hasStreak ? "fill" : "regular"}
      />
      <span
        className={cn(
          "font-semibold tabular-nums",
          size === "sm" ? "text-[12.5px]" : "text-[13.5px]",
          hasStreak ? (atRisk ? "text-danger" : "text-foreground") : "text-muted-soft"
        )}
      >
        {streak.current}
        {showLabel && (
          <span className="font-medium text-muted"> day{streak.current === 1 ? "" : "s"}</span>
        )}
      </span>
    </motion.div>
  );
}

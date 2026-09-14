"use client";

import { useState } from "react";
import Link from "next/link";
import { getTotalCompletedCount } from "@/lib/progress";
import { describeLevel } from "@/lib/levels";

export function ProgressMeter({ href = "/progress" }: { href?: string }) {
  const [completed] = useState(() =>
    typeof window === "undefined" ? 0 : getTotalCompletedCount()
  );
  const [ready] = useState(() => typeof window !== "undefined");
  const level = describeLevel(completed);

  if (!ready) {
    return (
      <div className="mt-auto px-3 py-3 rounded-[var(--radius-md)] bg-surface border border-border h-[72px] skeleton-bone" />
    );
  }

  return (
    <Link
      href={href}
      className="block mt-auto px-3 py-3 rounded-[var(--radius-md)] bg-surface border border-border pc-lift"
    >
      <p className="text-[13px] font-medium">{level.currentLabel}</p>
      <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
        <div className="h-full rounded-full bg-accent pc-meter-fill" style={{ width: `${level.percent}%` }} />
      </div>
      <p className="mt-1.5 text-[12px] text-muted">
        {level.nextLabel
          ? `${level.remaining} more scenario${level.remaining === 1 ? "" : "s"} to ${level.nextLabel}`
          : `${level.completed} scenarios completed`}
      </p>
    </Link>
  );
}

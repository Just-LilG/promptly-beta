"use client";

import { useState } from "react";
import Link from "next/link";
import { CaretRight, CheckCircle } from "@/icons";
import { tracks } from "@/lib/tracks";
import { getScenario } from "@/lib/scenarios";
import { getLastActivity } from "@/lib/progress";

function relativeTime(iso: string): string {
  const delta = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export function RecentActivity() {
  const [activity] = useState(() => {
    if (typeof window === "undefined") return null;
    return getLastActivity();
  });

  if (!activity) return null;

  const track = tracks.find((t) => t.slug === activity.trackSlug);
  const scenario = getScenario(activity.trackSlug, activity.scenarioSlug);
  if (!track || !scenario) return null;

  return (
    <div className="mt-8">
      <div className="flex items-end justify-between mb-3 px-0.5">
        <h2 className="text-[15px] font-semibold">Recent activity</h2>
        <Link
          href="/progress"
          className="text-[13px] text-muted flex items-center hover:text-foreground transition-colors"
        >
          See all <CaretRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <Link
        href={`/tracks/${activity.trackSlug}/${activity.scenarioSlug}`}
        className="flex items-center gap-3 py-3 px-3 rounded-[var(--radius-md)] bg-surface border border-border active:opacity-80 hover:border-accent/30 transition-colors"
      >
        <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-accent-soft flex items-center justify-center shrink-0">
          <CheckCircle className="w-[18px] h-[18px] text-accent" weight="fill" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium truncate">{scenario.title}</p>
          <p className="text-[12px] text-muted mt-0.5">{relativeTime(activity.completedAt)}</p>
        </div>
        <span className="text-[11.5px] font-medium text-accent shrink-0 tabular-nums">
          {activity.score}/100
        </span>
      </Link>
    </div>
  );
}

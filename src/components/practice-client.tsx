"use client";

import { useState } from "react";
import Link from "next/link";
import { CaretRight, Check, Barbell } from "@/icons";
import { Card } from "@/components/card";
import { getTrackProgress } from "@/lib/progress";

type PracticeSummary = { slug: string; title: string; goal: string };

export function PracticeClient({ scenarios }: { scenarios: PracticeSummary[] }) {
  // Lazy-init reads progress during the initial render itself, avoiding the
  // extra render pass (and the flash of "nothing completed" before the
  // effect ran) that setting this from inside a useEffect would cause.
  const [completed] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    const progress = getTrackProgress("practice");
    const map: Record<string, boolean> = {};
    for (const slug of Object.keys(progress)) map[slug] = true;
    return map;
  });

  const completedCount = Object.keys(completed).length;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 pt-6 md:pt-10 pb-8">
      <h1 className="text-[22px] font-semibold tracking-tight">Practice</h1>
      <p className="text-muted text-[14px] mt-1.5">
        Quick, cross-domain challenges. A few minutes each, no track required.
      </p>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${(completedCount / scenarios.length) * 100}%` }}
          />
        </div>
        <span className="text-[12.5px] text-muted shrink-0">
          {completedCount} of {scenarios.length}
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-2.5">
        {scenarios.map((s) => {
          const isComplete = completed[s.slug];
          return (
            <Link key={s.slug} href={`/practice/${s.slug}`}>
              <Card className="p-4 flex items-center gap-3.5 active:scale-[0.99] transition-transform">
                <div
                  className={`w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 ${
                    isComplete ? "bg-accent text-accent-foreground" : "bg-accent-soft text-accent"
                  }`}
                >
                  {isComplete ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Barbell className="w-[17px] h-[17px]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium truncate">{s.title}</p>
                  <p className="text-[12.5px] text-muted mt-0.5">2 min · Practice challenge</p>
                </div>
                <CaretRight className="w-4 h-4 text-muted-soft shrink-0" />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

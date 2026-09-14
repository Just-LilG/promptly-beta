"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CaretRight, Lock, Check } from "@/icons";
import { Card } from "@/components/card";
import { getTrackProgress } from "@/lib/progress";
import { StaggerGroup, StaggerItem } from "@/components/stagger-group";

export type ScenarioSummary = {
  slug: string;
  title: string;
};

export function TrackScenarioList({
  trackSlug,
  scenarios,
}: {
  trackSlug: string;
  scenarios: ScenarioSummary[];
}) {
  // Progress lives in localStorage, so it's unknown during server render.
  // Lazy-init reads it during the initial client render itself — `null`
  // only ever happens server-side, giving the same locked/unlocked-flash
  // protection as before without needing a separate hydration effect.
  const [completed] = useState<Record<string, boolean> | null>(() => {
    if (typeof window === "undefined") return null;
    const progress = getTrackProgress(trackSlug);
    const map: Record<string, boolean> = {};
    for (const slug of Object.keys(progress)) map[slug] = true;
    return map;
  });

  // Before hydration, render nothing gated — avoids a locked/unlocked flash mismatch.
  const hydrated = completed !== null;
  const completedMap = completed ?? {};
  const completedCount = Object.keys(completedMap).length;

  return (
    <>
      {scenarios.length > 0 && (
        <div className="mt-5 flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{
                width: hydrated ? `${(completedCount / scenarios.length) * 100}%` : "0%",
              }}
            />
          </div>
          <span className="text-[12.5px] text-muted shrink-0">
            {completedCount} of {scenarios.length}
          </span>
        </div>
      )}

      <StaggerGroup className="mt-6 flex flex-col gap-2.5">
        {scenarios.map((scenario, i) => {
          const isComplete = completedMap[scenario.slug];
          // A scenario unlocks once every prior scenario has been completed at least once.
          const priorSlugs = scenarios.slice(0, i).map((s) => s.slug);
          const isLocked = hydrated && priorSlugs.some((slug) => !completedMap[slug]);

          return (
            <StaggerItem key={scenario.slug}>
              <Link
                href={isLocked ? "#" : `/tracks/${trackSlug}/${scenario.slug}`}
                aria-disabled={isLocked}
                className={isLocked ? "pointer-events-none" : ""}
              >
                <Card
                  className={`p-4 flex items-center gap-3.5 active:scale-[0.99] transition-transform ${
                    isLocked ? "opacity-50" : ""
                  }`}
                >
                  <div
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0 overflow-hidden transition-colors duration-300 ${
                      isComplete
                        ? "bg-accent text-accent-foreground"
                        : "bg-border text-muted"
                    }`}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {isLocked ? (
                        <motion.span
                          key="lock"
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Lock className="w-3.5 h-3.5" />
                        </motion.span>
                      ) : isComplete ? (
                        <motion.span
                          key="check"
                          initial={{ opacity: 0, scale: 0.4, rotate: -45 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                        >
                          <Check className="w-4 h-4" />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="number"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          {i + 1}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium truncate">{scenario.title}</p>
                  </div>
                  {!isLocked && (
                    <CaretRight className="w-4 h-4 text-muted-soft shrink-0" />
                  )}
                </Card>
              </Link>
            </StaggerItem>
          );
        })}

        {scenarios.length === 0 && (
          <Card className="p-5 text-center">
            <p className="text-[13.5px] text-muted">
              This track is still being built. Check back soon.
            </p>
          </Card>
        )}
      </StaggerGroup>
    </>
  );
}

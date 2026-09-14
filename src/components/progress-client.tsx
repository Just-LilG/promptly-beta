"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Fire, Trophy, Target } from "@/icons";
import { Card } from "@/components/card";
import { tracks } from "@/lib/tracks";
import { getTrackScenarios } from "@/lib/scenarios";
import { getAllProgress } from "@/lib/progress";
import { getDisplayStreak } from "@/lib/streaks";
import { describeLevel } from "@/lib/levels";
import { StaggerGroup, StaggerItem } from "@/components/stagger-group";
import { TrackIcon } from "@/components/track-icon";

export function ProgressClient() {
  // Lazy-init reads progress during the initial render itself. `hydrated`
  // stays false only on the server (no window yet) so pages don't flash a
  // wrong "0" before real data is available; on the client it's already
  // correct on first paint, no separate effect needed.
  const [allProgress] = useState<Record<string, Record<string, { score: number }>>>(() =>
    typeof window === "undefined" ? {} : getAllProgress()
  );
  const [hydrated] = useState(() => typeof window !== "undefined");
  const [streak] = useState(() =>
    typeof window === "undefined" ? 0 : getDisplayStreak().current
  );

  const totalCompleted = Object.values(allProgress).reduce(
    (sum, track) => sum + Object.keys(track).length,
    0
  );
  const level = describeLevel(totalCompleted);

  const scoresFlat = Object.values(allProgress).flatMap((track) =>
    Object.values(track).map((r) => r.score)
  );
  const avgScore =
    scoresFlat.length > 0
      ? Math.round(scoresFlat.reduce((a, b) => a + b, 0) / scoresFlat.length)
      : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 pt-6 md:pt-10 pb-8">
      <h1 className="text-[22px] font-semibold tracking-tight">Progress</h1>
      <p className="text-muted text-[14px] mt-1.5">Your practice history across every track.</p>

      <StaggerGroup className="grid grid-cols-3 gap-2.5 mt-5">
        <StaggerItem>
          <Card className="p-3.5 flex flex-col items-center text-center">
            <Target className="w-4 h-4 text-accent mb-1.5" />
            <p className="text-[18px] font-semibold">{hydrated ? totalCompleted : "…"}</p>
            <p className="text-[11px] text-muted mt-0.5">Completed</p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="p-3.5 flex flex-col items-center text-center">
            <Trophy className="w-4 h-4 text-accent mb-1.5" />
            <p className="text-[18px] font-semibold">{hydrated ? avgScore : "…"}</p>
            <p className="text-[11px] text-muted mt-0.5">Avg score</p>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card className="p-3.5 flex flex-col items-center text-center">
            <Fire className="w-4 h-4 text-accent mb-1.5" />
            <p className="text-[18px] font-semibold">{hydrated ? streak : "…"}</p>
            <p className="text-[11px] text-muted mt-0.5">Day streak</p>
          </Card>
        </StaggerItem>
      </StaggerGroup>

      {hydrated && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Card className="p-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] text-muted">Current level</p>
                <p className="text-[15px] font-semibold mt-0.5">{level.currentLabel}</p>
              </div>
              {level.nextLabel && (
                <p className="text-[12px] text-muted text-right">
                  {level.remaining} more to<br />
                  <span className="text-foreground font-medium">{level.nextLabel}</span>
                </p>
              )}
            </div>
            {level.nextLabel && (
              <div className="mt-3 h-1.5 rounded-full bg-border overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${level.percent}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                />
              </div>
            )}
          </Card>
        </motion.div>
      )}

      <p className="text-[15px] font-semibold mt-6 mb-3">By track</p>
      <StaggerGroup className="flex flex-col gap-2.5">
        {tracks.map((track) => {
          const total = getTrackScenarios(track.slug).length;
          const completed = Object.keys(allProgress[track.slug] ?? {}).length;
          return (
            <StaggerItem key={track.slug}>
              <Link href={`/tracks/${track.slug}`}>
                <Card className="p-4 flex items-center gap-3.5 active:scale-[0.99] transition-transform">
                  <TrackIcon track={track} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium truncate">{track.name}</p>
                    <div className="mt-1.5 h-1 rounded-full bg-border overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-accent"
                        initial={{ width: 0 }}
                        animate={{ width: total > 0 ? `${(completed / total) * 100}%` : "0%" }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                      />
                    </div>
                  </div>
                  <span className="text-[12px] text-muted shrink-0">
                    {hydrated ? completed : "…"}/{total}
                  </span>
                </Card>
              </Link>
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </div>
  );
}

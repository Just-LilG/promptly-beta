"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "@/icons";
import { Card } from "@/components/card";
import { BrandMark } from "@/components/brand-mark";
import { Bone } from "@/components/skeleton";
import { tracks } from "@/lib/tracks";
import { getTrackScenarios } from "@/lib/scenarios";
import { getOnboardingProfile } from "@/lib/onboarding";
import { getLastActivity, getTrackProgress, type LastActivity } from "@/lib/progress";
import { useI18n } from "@/components/locale-provider";

type ContinueTarget = {
  trackSlug: string;
  trackName: string;
  scenarioSlug: string;
  scenarioTitle: string;
  kind: "resume" | "next" | "start";
  lastScore: number | null;
};

function computeTarget(last: LastActivity | null): ContinueTarget | null {
  // Fresh user — start them in the track they picked at onboarding, not always coding.
  if (!last) {
    const interest = getOnboardingProfile()?.primaryInterest;
    const track = tracks.find((item) => item.slug === interest) ?? tracks[0];
    const firstScenario = getTrackScenarios(track.slug)[0];
    if (!firstScenario) return null;
    return {
      trackSlug: track.slug,
      trackName: track.name,
      scenarioSlug: firstScenario.slug,
      scenarioTitle: firstScenario.title,
      kind: "start",
      lastScore: null,
    };
  }

  const track = tracks.find((t) => t.slug === last.trackSlug);
  const scenarios = getTrackScenarios(last.trackSlug);
  const trackProgress = getTrackProgress(last.trackSlug);
  const nextUnstarted = scenarios.find((s) => !trackProgress[s.slug]);

  if (!track) return null;

  // If there's an unstarted scenario left in the same track the user was
  // just working in, surface that as "next" rather than re-showing what
  // they already finished.
  if (nextUnstarted) {
    return {
      trackSlug: track.slug,
      trackName: track.name,
      scenarioSlug: nextUnstarted.slug,
      scenarioTitle: nextUnstarted.title,
      kind: "next",
      lastScore: null,
    };
  }

  // Whole track finished — resume by pointing back at the last thing they did.
  const lastScenario = scenarios.find((s) => s.slug === last.scenarioSlug);
  if (!lastScenario) return null;
  return {
    trackSlug: track.slug,
    trackName: track.name,
    scenarioSlug: lastScenario.slug,
    scenarioTitle: lastScenario.title,
    kind: "resume",
    lastScore: last.score,
  };
}

export function ContinueCard({ greeting }: { greeting?: string | null } = {}) {
  const { t } = useI18n();
  // Lazy-init computes the target once on the client during the initial
  // render, avoiding a second render pass and the flash of a placeholder
  // that a useEffect + setState approach would cause.
  const [target] = useState<ContinueTarget | null | "loading">(() =>
    typeof window === "undefined" ? "loading" : computeTarget(getLastActivity())
  );

  if (target === "loading") {
    return (
      <Bone className="h-[180px] md:h-[168px] rounded-[var(--radius-lg)]" />
    );
  }

  if (!target) return null;

  const trackLabel = t(`tracks.${target.trackSlug}.name`);

  const eyebrow = greeting
    ? greeting
    : target.kind === "start"
      ? t("home.getStarted")
      : target.kind === "next"
        ? t("home.nextTrack", { track: trackLabel })
        : t("home.continueTrack", { track: trackLabel });

  const body =
    target.kind === "start"
      ? t("home.startBody")
      : target.kind === "next"
        ? t("home.nextBody")
        : target.lastScore !== null
          ? t("home.resumeScore", { score: target.lastScore })
          : t("home.resumeBody");

  const cta =
    target.kind === "start"
      ? t("home.startCta")
      : target.kind === "next"
        ? t("home.nextCta")
        : t("home.resumeCta");

  return (
    <div>
      <Link href={`/tracks/${target.trackSlug}/${target.scenarioSlug}`} className="block">
        <Card className="p-5 md:p-6 relative overflow-hidden border-accent/25 active:scale-[0.99] md:active:scale-100 transition-transform pc-lift pc-continue">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--accent) 22%, transparent) 0%, transparent 62%)",
            }}
          />
          <div
            className="absolute -right-16 -top-16 w-56 h-56 md:w-72 md:h-72 rounded-full opacity-[0.14] pc-continue-orb"
            style={{ background: "var(--accent)" }}
          />
          {target.kind === "start" && (
            <div className="absolute right-5 top-5 z-[1] w-12 h-12 rounded-full bg-accent-soft/90 flex items-center justify-center">
              <BrandMark size={44} alt="Promptly" className="rounded-full bg-transparent" />
            </div>
          )}
          <p className="relative text-[17px] md:text-[16px] font-semibold text-accent tracking-tight">
            {eyebrow}
          </p>
          <h2 className="relative text-[20px] md:text-[22px] font-semibold tracking-tight mt-1 max-w-xl text-pretty">
            {target.scenarioTitle}
          </h2>
          <p className="relative text-muted text-[13.5px] mt-1.5 max-w-md">{body}</p>
          <div className="relative mt-4 md:mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-pill)] bg-accent text-accent-foreground text-[13.5px] font-medium">
            {cta}
            <ArrowRight className="w-4 h-4 pc-cta-arrow" />
          </div>
        </Card>
      </Link>
    </div>
  );
}

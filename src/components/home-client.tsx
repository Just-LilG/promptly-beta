"use client";

import Link from "next/link";
import { CaretRight, Target } from "@/icons";
import { Card } from "@/components/card";
import { StreakBadge } from "@/components/streak-badge";
import { ContinueCard } from "@/components/continue-card";
import { RecentActivity } from "@/components/recent-activity";
import { HomeTrackCarousel } from "@/components/home-track-carousel";
import { SuggestedTrackCard } from "@/components/suggested-track-card";
import { HomeProgressCard } from "@/components/home-progress-card";
import { HomeToolsShelf } from "@/components/home-tools-shelf";
import { useI18n } from "@/components/locale-provider";

export function HomeClient() {
  const { t } = useI18n();
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-10 pt-3 md:pt-12 pb-8 pc-stagger">
      <h1 className="sr-only">{t("home.title")}</h1>
      <div className="hidden md:flex items-center justify-between gap-4 mb-6">
        <p className="text-[15px] font-semibold tracking-tight" aria-hidden="true">
          {t("home.title")}
        </p>
        <StreakBadge size="md" showLabel />
      </div>

      <ContinueCard />

      <div className="mt-8 md:mt-10">
        <HomeTrackCarousel hero />
      </div>

      <div className="mt-4 md:mt-8 flex flex-col gap-2.5">
        <SuggestedTrackCard />
        <Link href="/task-coach" className="block">
          <Card className="p-3.5 flex items-center gap-3.5 active:scale-[0.99] md:active:scale-100 transition-transform hover:border-accent/30 pc-lift">
            <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-accent-soft flex items-center justify-center shrink-0">
              <Target className="w-[17px] h-[17px] text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium">{t("home.byoTitle")}</p>
              <p className="text-[12.5px] text-muted mt-0.5">{t("home.byoBody")}</p>
            </div>
            <CaretRight className="w-4 h-4 text-muted-soft shrink-0 pc-cta-arrow" />
          </Card>
        </Link>
        <HomeProgressCard />
      </div>

      <HomeToolsShelf />

      <RecentActivity />
    </div>
  );
}

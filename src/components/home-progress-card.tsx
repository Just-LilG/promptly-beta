"use client";

import { useState } from "react";
import Link from "next/link";
import { CaretRight, ChartBar } from "@/icons";
import { Card } from "@/components/card";
import { getTotalCompletedCount } from "@/lib/progress";
import { describeLevel } from "@/lib/levels";
import { useI18n } from "@/components/locale-provider";

export function HomeProgressCard() {
  const { t } = useI18n();
  const [completed] = useState(() =>
    typeof window === "undefined" ? 0 : getTotalCompletedCount()
  );
  const level = describeLevel(completed);

  return (
    <Link href="/progress" className="block">
      <Card className="p-3.5 flex items-center gap-3.5 active:scale-[0.99] md:active:scale-100 transition-transform hover:border-accent/30 pc-lift">
        <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-accent-soft flex items-center justify-center shrink-0">
          <ChartBar className="w-[17px] h-[17px] text-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium">{t("nav.progress")}</p>
          <p className="text-[12.5px] text-muted mt-0.5 truncate">
            {level.nextLabel
              ? t("home.progressNext", { n: level.remaining, level: level.nextLabel })
              : t("home.progressDone", { n: level.completed })}
          </p>
          <div className="mt-2 h-1 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-accent pc-meter-fill"
              style={{ width: `${level.percent}%` }}
            />
          </div>
        </div>
        <CaretRight className="w-4 h-4 text-muted-soft shrink-0 pc-cta-arrow" />
      </Card>
    </Link>
  );
}

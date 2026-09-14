"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Briefcase,
  CaretRight,
  ChartBar,
  ChatCircle,
  CheckCircle,
  Fire,
  FlowArrow,
  Gear,
  GraduationCap,
  Pen,
  SignIn,
  Trophy,
} from "@/icons";
import { Card } from "@/components/card";
import { SettingsRow } from "@/components/settings-row";
import { UserAvatar } from "@/components/user-avatar";
import { useI18n } from "@/components/locale-provider";
import { emailHandle, getGuestHandle } from "@/lib/display-name";
import { getLastActivity, getTotalCompletedCount, type LastActivity } from "@/lib/progress";
import { describeLevel } from "@/lib/levels";
import { getDisplayStreak } from "@/lib/streaks";
import { getWorkflows } from "@/lib/workflows";
import { tracks } from "@/lib/tracks";
import { getScenario } from "@/lib/scenarios";

export function AccountClient() {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const [guest, setGuest] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [saved, setSaved] = useState(0);
  const [last, setLast] = useState<LastActivity | null>(null);

  useEffect(() => {
    setGuest(getGuestHandle());
    setStreak(getDisplayStreak().current);
    setCompleted(getTotalCompletedCount());
    setSaved(getWorkflows().length);
    setLast(getLastActivity());
  }, []);

  const signedIn = status === "authenticated" && Boolean(session?.user);
  const name =
    (signedIn ? session?.user?.name?.trim() || null : null) ??
    (signedIn ? emailHandle(session?.user?.email) : null) ??
    guest;
  const subtitle = signedIn ? session?.user?.email ?? null : guest;
  const level = describeLevel(completed);
  const lastTrack = last ? tracks.find((row) => row.slug === last.trackSlug) : null;
  const lastScenario = last ? getScenario(last.trackSlug, last.scenarioSlug) : null;

  return (
    <div className="page-no-topbar max-w-md mx-auto px-4 md:px-8 pb-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[22px] font-semibold tracking-tight">{t("account.title")}</h1>
        <Link
          href="/settings"
          aria-label={t("settings.title")}
          className="w-10 h-10 rounded-full border border-border bg-surface flex items-center justify-center"
        >
          <Gear className="w-5 h-5" />
        </Link>
      </div>

      <div className="mt-5 flex items-center gap-3.5">
        <span className="w-[4.25rem] h-[4.25rem] rounded-full overflow-hidden border border-border bg-accent-soft shrink-0">
          <UserAvatar className="w-full h-full" alt="" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[18px] font-semibold tracking-tight truncate">{name ?? "…"}</p>
          {subtitle && <p className="text-[13px] text-muted truncate mt-0.5">{subtitle}</p>}
          <Link
            href="/account/edit"
            className="mt-1.5 inline-flex items-center gap-1 text-[13px] font-medium text-accent"
          >
            <Pen className="w-3.5 h-3.5" />
            {t("account.editProfile")}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5 mt-6">
        <Card className="p-3.5 flex flex-col items-center text-center">
          <Fire className="w-4 h-4 text-accent mb-1.5" />
          <p className="text-[18px] font-semibold">{streak}</p>
          <p className="text-[11px] text-muted mt-0.5">{t("account.statsStreak")}</p>
        </Card>
        <Card className="p-3.5 flex flex-col items-center text-center">
          <Trophy className="w-4 h-4 text-accent mb-1.5" />
          <p className="text-[18px] font-semibold">{completed}</p>
          <p className="text-[11px] text-muted mt-0.5">{t("account.statsDone")}</p>
        </Card>
        <Card className="p-3.5 flex flex-col items-center text-center min-w-0">
          <ChartBar className="w-4 h-4 text-accent mb-1.5" />
          <p className="text-[13px] font-semibold leading-tight px-0.5 line-clamp-2">{level.currentLabel}</p>
          <p className="text-[11px] text-muted mt-0.5">{t("account.statsLevel")}</p>
        </Card>
      </div>

      <Link href="/progress" className="block mt-3">
        <Card className="p-3.5 flex items-center gap-3.5 active:scale-[0.99] transition-transform">
          <span className="w-9 h-9 rounded-[var(--radius-sm)] bg-accent-soft flex items-center justify-center shrink-0">
            <ChartBar className="w-[17px] h-[17px] text-accent" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-medium">{t("account.viewProgress")}</span>
            <span className="block text-[12.5px] text-muted mt-0.5 truncate">
              {level.nextLabel
                ? t("home.progressNext", { n: level.remaining, level: level.nextLabel })
                : t("home.progressDone", { n: level.completed })}
            </span>
            <span className="mt-2 h-1 rounded-full bg-border overflow-hidden block">
              <span
                className="h-full rounded-full bg-accent block"
                style={{ width: `${level.percent}%` }}
              />
            </span>
          </span>
          <CaretRight className="w-4 h-4 text-muted-soft shrink-0" />
        </Card>
      </Link>

      {last && lastScenario && lastTrack && (
        <Link
          href={`/tracks/${last.trackSlug}/${last.scenarioSlug}`}
          className="block mt-3"
        >
          <Card className="p-3.5 flex items-center gap-3.5 active:scale-[0.99] transition-transform">
            <span className="w-9 h-9 rounded-[var(--radius-sm)] bg-accent-soft flex items-center justify-center shrink-0">
              <CheckCircle className="w-[17px] h-[17px] text-accent" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium">{t("account.lastPractice")}</span>
              <span className="block text-[12.5px] text-muted mt-0.5 truncate">{lastScenario.title}</span>
            </span>
            <span className="text-[12px] font-medium text-accent tabular-nums shrink-0">
              {last.score}/100
            </span>
          </Card>
        </Link>
      )}

      <p className="text-[12px] font-medium text-muted mt-7 mb-2 px-1">{t("account.practiceGroup")}</p>
      <Card className="overflow-hidden p-0">
        <SettingsRow
          href="/learn"
          leading={<GraduationCap className="w-[17px] h-[17px] text-accent" />}
          title={t("nav.learn")}
          hint={t("home.startBody")}
        />
        <SettingsRow
          href="/sandbox"
          leading={<ChatCircle className="w-[17px] h-[17px] text-accent" />}
          title={t("nav.sandbox")}
          hint={t("sandbox.localBlurb")}
        />
        <SettingsRow
          href="/tools"
          leading={<Briefcase className="w-[17px] h-[17px] text-accent" />}
          title={t("nav.tools")}
          hint={t("tools.subtitle")}
        />
        <SettingsRow
          href="/workflows"
          leading={<FlowArrow className="w-[17px] h-[17px] text-accent" />}
          title={t("account.savedPrompts")}
          hint={
            saved > 0
              ? t("account.savedPromptsHint", { n: saved })
              : t("account.savedNone")
          }
        />
      </Card>

      <p className="text-[12px] font-medium text-muted mt-7 mb-2 px-1">{t("account.settings")}</p>
      <Card className="overflow-hidden p-0">
        <SettingsRow
          href="/settings"
          leading={<Gear className="w-[17px] h-[17px] text-accent" />}
          title={t("settings.title")}
          hint={t("account.settingsHint")}
        />
      </Card>

      {status === "unauthenticated" && (
        <>
          <p className="mt-7 text-center text-[13.5px] text-muted px-4">{t("account.signInKeep")}</p>
          <Link
            href="/login"
            className="mt-3 mx-auto flex w-fit items-center justify-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-pill)] bg-accent text-accent-foreground text-[13.5px] font-medium active:scale-95"
          >
            <SignIn className="w-4 h-4" />
            {t("account.signIn")}
          </Link>
        </>
      )}
    </div>
  );
}

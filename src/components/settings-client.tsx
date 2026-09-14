"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Bell, BookOpen, Briefcase, CaretLeft, ChartBar, Lock, Palette, SignIn, SignOut, User } from "@/icons";
import { Card } from "@/components/card";
import { SettingsRow } from "@/components/settings-row";
import { LocaleFlag } from "@/components/locale-flag";
import { UserAvatar } from "@/components/user-avatar";
import { LOCALE_META } from "@/lib/i18n";
import { useI18n } from "@/components/locale-provider";
import { useTheme } from "@/components/theme-provider";
import { emailHandle, firstWord, getGuestHandle } from "@/lib/display-name";
import { getNotificationPermission, getNotifyPrefs } from "@/lib/notifications";

export function SettingsClient() {
  const { t, locale, usesDeviceLocale } = useI18n();
  const { choice: themeChoice } = useTheme();
  const { data: session, status } = useSession();
  const [guest, setGuest] = useState<string | null>(null);
  const [notifyHint, setNotifyHint] = useState("");

  useEffect(() => {
    setGuest(getGuestHandle());
  }, []);

  useEffect(() => {
    const permission = getNotificationPermission();
    const prefs = getNotifyPrefs();
    if (permission === "granted" && prefs.alerts) setNotifyHint(t("notifications.on"));
    else if (permission === "denied") setNotifyHint(t("notifications.off"));
    else setNotifyHint(t("account.settingsNotifyHint"));
  }, [t]);

  const signedIn = status === "authenticated" && Boolean(session?.user);
  const name =
    (signedIn ? firstWord(session?.user?.name) : null) ??
    (signedIn ? emailHandle(session?.user?.email) : null) ??
    guest;
  const langName = LOCALE_META[locale].nativeName;
  const langHint = usesDeviceLocale ? t("language.followingDevice", { language: langName }) : langName;
  const themeHint =
    themeChoice === "system"
      ? t("appearance.system")
      : themeChoice === "dark"
        ? t("appearance.dark")
        : t("appearance.light");

  return (
    <div className="page-no-topbar max-w-md mx-auto px-4 md:px-8 pb-8">
      <div className="flex items-center gap-2 mb-5">
        <Link
          href="/account"
          className="inline-flex items-center justify-center w-10 h-10 -ms-2 rounded-full text-muted"
          aria-label={t("account.back")}
        >
          <CaretLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-[22px] font-semibold tracking-tight flex-1">{t("settings.title")}</h1>
      </div>

      <Link href="/account" className="block">
        <Card className="p-3.5 flex items-center gap-3.5 active:scale-[0.99] transition-transform">
          <span className="w-12 h-12 rounded-full overflow-hidden border border-border shrink-0 bg-accent-soft">
            <UserAvatar className="w-full h-full" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold tracking-tight truncate">
              {status === "loading" || !name ? "…" : name}
            </span>
            <span className="block text-[12.5px] text-muted mt-0.5">{t("account.manageProfile")}</span>
          </span>
        </Card>
      </Link>

      <p className="text-[12px] font-medium text-muted mt-7 mb-2 px-1">{t("settings.appGroup")}</p>
      <Card className="overflow-hidden p-0">
        <SettingsRow
          href="/language"
          leading={<LocaleFlag locale={locale} className="w-full h-full" label={langName} />}
          title={t("language.title")}
          hint={langHint}
        />
        <SettingsRow
          href="/appearance"
          leading={<Palette className="w-[17px] h-[17px] text-accent" />}
          title={t("appearance.title")}
          hint={themeHint}
        />
        <SettingsRow
          href="/settings/notifications"
          leading={<Bell className="w-[17px] h-[17px] text-accent" />}
          title={t("notifications.permissionTitle")}
          hint={notifyHint || t("account.settingsNotifyHint")}
        />
      </Card>

      <p className="text-[12px] font-medium text-muted mt-7 mb-2 px-1">{t("settings.practiceGroup")}</p>
      <Card className="overflow-hidden p-0">
        <SettingsRow
          href="/progress"
          leading={<ChartBar className="w-[17px] h-[17px] text-accent" />}
          title={t("nav.progress")}
          hint={t("navBlurb.progress")}
        />
        <SettingsRow
          href="/tools"
          leading={<Briefcase className="w-[17px] h-[17px] text-accent" />}
          title={t("nav.tools")}
          hint={t("tools.subtitle")}
        />
        <SettingsRow
          href="/notifications"
          leading={<Bell className="w-[17px] h-[17px] text-accent" />}
          title={t("notifications.inbox")}
          hint={t("notifications.subtitle")}
        />
        <SettingsRow
          href="/reference"
          leading={<BookOpen className="w-[17px] h-[17px] text-accent" />}
          title={t("nav.reference")}
          hint={t("navBlurb.reference")}
        />
      </Card>

      <p className="text-[12px] font-medium text-muted mt-7 mb-2 px-1">{t("settings.youGroup")}</p>
      <Card className="overflow-hidden p-0">
        <SettingsRow
          href="/account/edit"
          leading={<User className="w-[17px] h-[17px] text-accent" />}
          title={t("account.editProfile")}
          hint={t("account.editProfileHint")}
        />
        {signedIn && (
          <SettingsRow
            href="/account/edit"
            leading={<Lock className="w-[17px] h-[17px] text-accent" />}
            title={t("account.changePassword")}
            hint={session?.user?.email ?? undefined}
          />
        )}
      </Card>

      <p className="text-[12px] font-medium text-muted mt-7 mb-2 px-1">{t("settings.aboutGroup")}</p>
      <Card className="p-4">
        <p className="text-[14px] font-medium">{t("home.title")}</p>
        <p className="text-[13px] text-muted mt-1.5 leading-snug">{t("settings.aboutBody")}</p>
      </Card>

      {status === "unauthenticated" && (
        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-pill)] bg-accent text-accent-foreground text-[13.5px] font-medium active:scale-95"
        >
          <SignIn className="w-4 h-4" />
          {t("account.signIn")}
        </Link>
      )}

      {signedIn && (
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-6 w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-pill)] bg-surface border border-border text-[13.5px] font-medium active:scale-95"
        >
          <SignOut className="w-4 h-4" />
          {t("account.signOut")}
        </button>
      )}
    </div>
  );
}

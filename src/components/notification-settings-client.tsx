"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CaretLeft, Fire } from "@/icons";
import { Card } from "@/components/card";
import { useI18n } from "@/components/locale-provider";
import {
  getNotificationPermission,
  getNotifyPrefs,
  isLikelyIOS,
  isStandaloneApp,
  notificationsSupported,
  requestNotificationPermission,
  sendTestAlert,
  setNotifyPrefs,
  type NotifyPrefs,
} from "@/lib/notifications";

export function NotificationSettingsClient() {
  const { t } = useI18n();
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [prefs, setPrefs] = useState<NotifyPrefs>({ alerts: false, streakReminders: true });
  const [iosHome, setIosHome] = useState(false);
  const [testNote, setTestNote] = useState<"ok" | "fail" | null>(null);
  const [busy, setBusy] = useState(false);

  const sync = useCallback(() => {
    setPermission(getNotificationPermission());
    setPrefs(getNotifyPrefs());
    setIosHome(isLikelyIOS() && !isStandaloneApp());
  }, []);

  useEffect(() => {
    sync();
  }, [sync]);

  const allow = async () => {
    setBusy(true);
    setTestNote(null);
    await requestNotificationPermission();
    sync();
    setBusy(false);
  };

  const sendTest = async () => {
    setBusy(true);
    const ok = await sendTestAlert(t("notifications.itemTestTitle"), t("notifications.itemTestBody"));
    setTestNote(ok ? "ok" : "fail");
    setBusy(false);
  };

  return (
    <div className="page-no-topbar max-w-md mx-auto px-4 md:px-8 pb-8">
      <div className="flex items-center gap-2">
        <Link
          href="/settings"
          className="inline-flex items-center justify-center w-10 h-10 -ms-2 rounded-full text-muted"
          aria-label={t("notifications.back")}
        >
          <CaretLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-[22px] font-semibold tracking-tight flex-1">{t("notifications.permissionTitle")}</h1>
      </div>
      <p className="text-[13.5px] text-muted mt-2 px-1">{t("notifications.permissionBody")}</p>

      <Card className="mt-6 p-4">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-accent-soft flex items-center justify-center shrink-0">
            <Bell className="w-[17px] h-[17px] text-accent" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-medium">{t("notifications.permissionTitle")}</p>
            {!notificationsSupported() || permission === "unsupported" ? (
              <p className="text-[12.5px] text-muted mt-1 leading-snug">{t("notifications.unsupported")}</p>
            ) : permission === "denied" ? (
              <p className="text-[12.5px] text-muted mt-1 leading-snug">{t("notifications.blockedBody")}</p>
            ) : permission === "granted" ? (
              <label className="mt-3 flex items-center justify-between gap-3">
                <span className="text-[13px] text-muted">{prefs.alerts ? t("notifications.on") : t("notifications.off")}</span>
                <input
                  type="checkbox"
                  checked={prefs.alerts}
                  onChange={(event) => setPrefs(setNotifyPrefs({ alerts: event.target.checked }))}
                />
              </label>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => void allow()}
                className="mt-3 inline-flex items-center px-4 py-2 rounded-[var(--radius-pill)] bg-accent text-accent-foreground text-[13.5px] font-medium active:scale-95 disabled:opacity-60"
              >
                {t("notifications.turnOn")}
              </button>
            )}
            {iosHome && (
              <p className="text-[12.5px] text-muted mt-2 leading-snug">{t("notifications.iosHint")}</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="mt-3 p-4">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-accent-soft flex items-center justify-center shrink-0">
            <Fire className="w-[17px] h-[17px] text-accent" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-medium">{t("notifications.streakTitle")}</p>
            <p className="text-[12.5px] text-muted mt-1 leading-snug">{t("notifications.streakBody")}</p>
            <label className="mt-3 flex items-center justify-between gap-3">
              <span className="text-[13px] text-muted">
                {prefs.streakReminders ? t("notifications.on") : t("notifications.off")}
              </span>
              <input
                type="checkbox"
                checked={prefs.streakReminders}
                onChange={(event) => setPrefs(setNotifyPrefs({ streakReminders: event.target.checked }))}
              />
            </label>
          </div>
        </div>
      </Card>

      {permission === "granted" && prefs.alerts && (
        <button
          type="button"
          disabled={busy}
          onClick={() => void sendTest()}
          className="mt-6 w-full flex items-center justify-center px-4 py-2.5 rounded-[var(--radius-pill)] bg-surface border border-border text-[13.5px] font-medium active:scale-95 disabled:opacity-60"
        >
          {t("notifications.test")}
        </button>
      )}
      {testNote === "ok" && (
        <p className="mt-2 text-center text-[12.5px] text-muted">{t("notifications.testSent")}</p>
      )}
      {testNote === "fail" && (
        <p className="mt-2 text-center text-[12.5px] text-muted">{t("notifications.testFail")}</p>
      )}
    </div>
  );
}

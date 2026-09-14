"use client";

import { useEffect } from "react";
import { maybePushStreakReminder, refreshInbox } from "@/lib/notifications";
import { getDisplayStreak } from "@/lib/streaks";
import { useI18n } from "@/components/locale-provider";

export function NotificationsWatcher() {
  const { t } = useI18n();

  useEffect(() => {
    refreshInbox();
    const streak = getDisplayStreak();
    void maybePushStreakReminder(
      t("notifications.itemStreakTitle"),
      t("notifications.itemStreakBody", { n: streak.current })
    );
  }, [t]);

  return null;
}

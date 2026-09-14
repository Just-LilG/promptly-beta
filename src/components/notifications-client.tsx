"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CaretLeft, CaretRight, Check, Fire } from "@/icons";
import { Card } from "@/components/card";
import { useI18n } from "@/components/locale-provider";
import {
  clearInbox,
  getInbox,
  markAllRead,
  markItemRead,
  refreshInbox,
  type InboxItem,
  type NotifyKind,
  INBOX_EVENT,
} from "@/lib/notifications";

function kindIcon(kind: NotifyKind) {
  if (kind === "streak") return Fire;
  if (kind === "test") return Check;
  return Bell;
}

function cap(kind: NotifyKind) {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

export function NotificationsClient() {
  const { t } = useI18n();
  const [items, setItems] = useState<InboxItem[]>([]);

  const sync = useCallback(() => {
    refreshInbox();
    setItems(getInbox());
  }, []);

  useEffect(() => {
    sync();
    markAllRead();
    setItems(getInbox());
    window.addEventListener(INBOX_EVENT, sync);
    return () => window.removeEventListener(INBOX_EVENT, sync);
  }, [sync]);

  const titleFor = (item: InboxItem) => t(`notifications.item${cap(item.kind)}Title`);
  const bodyFor = (item: InboxItem) => t(`notifications.item${cap(item.kind)}Body`, item.vars);

  return (
    <div className="page-no-topbar max-w-md mx-auto px-4 md:px-8 pb-8">
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="inline-flex items-center justify-center w-10 h-10 -ms-2 rounded-full text-muted"
          aria-label={t("notifications.back")}
        >
          <CaretLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-[22px] font-semibold tracking-tight flex-1">{t("notifications.inbox")}</h1>
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => {
              clearInbox();
              setItems([]);
            }}
            className="text-[13px] font-medium text-muted px-2 py-1"
          >
            {t("notifications.clear")}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <Card className="mt-8 p-8 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-accent-soft flex items-center justify-center">
            <Bell className="w-6 h-6 text-accent" />
          </div>
          <p className="mt-4 text-[16px] font-semibold tracking-tight">{t("notifications.emptyTitle")}</p>
          <p className="mt-1.5 text-[13.5px] text-muted max-w-xs">{t("notifications.emptyBody")}</p>
        </Card>
      ) : (
        <div className="mt-5 flex flex-col gap-2">
          {items.map((item) => {
            const Icon = kindIcon(item.kind);
            return (
              <Link key={item.id} href={item.href} onClick={() => markItemRead(item.id)}>
                <Card className="p-4 flex items-start gap-3.5 active:scale-[0.99] transition-transform">
                  <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-accent-soft flex items-center justify-center shrink-0">
                    <Icon className="w-[17px] h-[17px] text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium">{titleFor(item)}</p>
                    <p className="text-[12.5px] text-muted mt-0.5 leading-snug">{bodyFor(item)}</p>
                  </div>
                  <CaretRight className="w-4 h-4 text-muted-soft shrink-0 mt-1" />
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

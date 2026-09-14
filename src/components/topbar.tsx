"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bell, CaretDown } from "@/icons";
import { StreakBadge } from "@/components/streak-badge";
import { UserAvatar } from "@/components/user-avatar";
import { emailHandle, getGuestHandle } from "@/lib/display-name";
import { useI18n } from "@/components/locale-provider";
import { subscribeToScrollHide, syncScrollPosition } from "@/lib/scroll-hide-bus";
import { INBOX_EVENT, unreadCount } from "@/lib/notifications";

function hidePhoneTopbar(pathname: string) {
  return ["/language", "/account", "/notifications", "/appearance", "/settings"].some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}
const TOP_HIDDEN = "env(safe-area-inset-top, 0px)";

function setTopChrome(value: string) {
  document.documentElement.style.setProperty("--top-chrome", value);
}

export function Topbar() {
  const { t } = useI18n();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const headerRef = useRef<HTMLElement>(null);
  const [guestHandle, setGuestHandle] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const [unread, setUnread] = useState(0);
  const hideForRoute = hidePhoneTopbar(pathname);

  useEffect(() => {
    setGuestHandle(getGuestHandle());
  }, []);

  useEffect(() => {
    const read = () => setUnread(unreadCount());
    read();
    window.addEventListener(INBOX_EVENT, read);
    return () => window.removeEventListener(INBOX_EVENT, read);
  }, []);

  useEffect(() => {
    return subscribeToScrollHide(setHidden);
  }, []);

  useEffect(() => {
    const apply = () => {
      if (window.matchMedia("(min-width: 768px)").matches || hideForRoute) {
        setTopChrome("0px");
        return;
      }
      if (hidden) {
        setTopChrome(TOP_HIDDEN);
      } else {
        const height = headerRef.current?.offsetHeight;
        setTopChrome(height ? `${height}px` : "5.5rem");
      }
      const baseline = () => syncScrollPosition(window, window.scrollY);
      baseline();
      requestAnimationFrame(baseline);
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [hidden, hideForRoute]);

  const signedIn = status === "authenticated" && Boolean(session?.user);
  const name =
    (signedIn ? session?.user?.name?.trim() || null : null) ??
    (signedIn ? emailHandle(session?.user?.email) : null) ??
    guestHandle;
  const subtitle = signedIn ? session?.user?.email ?? null : guestHandle;

  if (hideForRoute) return null;

  return (
    <header
      ref={headerRef}
      className="md:hidden fixed top-0 inset-x-0 z-40 phone-topbar phone-chrome-slide"
      style={{
        transform: hidden ? "translateY(-110%)" : "translateY(0)",
        pointerEvents: hidden ? "none" : undefined,
      }}
    >
      <div className="topbar-fade" aria-hidden>
        <div className="topbar-fade-solid" />
        <div className="topbar-fade-blur" />
      </div>
      <div className="relative flex items-center justify-between gap-2.5 px-4 py-2.5">
        <Link
          href="/account"
          className="flex items-center gap-2.5 min-w-0 flex-1"
          aria-label={name ? `${t("nav.account")}, ${name}` : t("nav.account")}
        >
          <span className="w-11 h-11 rounded-full bg-accent-soft border border-border/80 overflow-hidden shrink-0">
            <UserAvatar className="w-full h-full" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-[16px] font-semibold tracking-tight leading-tight shrink-0">
                {t("home.yo")}
              </span>
              <span className="text-[16px] font-semibold tracking-tight truncate leading-tight">
                {status === "loading" || !name ? "…" : name}
              </span>
            </span>
            {subtitle && (
              <span className="block text-[12px] text-muted truncate leading-tight mt-0.5">
                {subtitle}
              </span>
            )}
          </span>
          <CaretDown className="w-4 h-4 text-muted shrink-0" />
        </Link>
        <div className="flex items-center gap-2 shrink-0">
          <StreakBadge size="sm" />
          <Link
            href="/notifications"
            aria-label={
              unread > 0
                ? `${t("nav.notifications")}, ${unread}`
                : t("nav.notifications")
            }
            className="relative w-9 h-9 rounded-full border border-border bg-surface flex items-center justify-center"
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

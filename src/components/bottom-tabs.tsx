"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNavItems } from "@/lib/nav";
import { NAV_LABEL_KEY } from "@/lib/i18n";
import { useI18n } from "@/components/locale-provider";
import { cn } from "@/lib/cn";
import {
  subscribeToScrollHide,
  attachChromeScrollSource,
  resetScrollHide,
  syncScrollPosition,
} from "@/lib/scroll-hide-bus";

const CHROME_DESKTOP = "2rem";
const CHROME_HIDDEN = "max(8px, env(safe-area-inset-bottom, 0px))";

function setBottomChrome(value: string) {
  document.documentElement.style.setProperty("--bottom-chrome", value);
}

export function BottomTabs() {
  const { t } = useI18n();
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  const [hidden, setHidden] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    return subscribeToScrollHide(setHidden);
  }, []);

  useEffect(() => {
    const read = () =>
      setKeyboardOpen(document.documentElement.dataset.keyboard === "open");
    read();
    window.addEventListener("promptly:keyboard", read);
    return () => window.removeEventListener("promptly:keyboard", read);
  }, []);

  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      resetScrollHide();
    }
  }, [pathname]);

  useEffect(() => attachChromeScrollSource(window), []);

  useEffect(() => {
    const apply = () => {
      if (window.matchMedia("(min-width: 768px)").matches) {
        setBottomChrome(CHROME_DESKTOP);
        return;
      }
      if (document.documentElement.dataset.keyboard === "open" || keyboardOpen) {
        setBottomChrome(CHROME_HIDDEN);
        return;
      }
      if (hidden) {
        setBottomChrome(CHROME_HIDDEN);
      } else {
        const height = navRef.current?.offsetHeight;
        setBottomChrome(height ? `${height}px` : "5.5rem");
      }
      const baseline = () => syncScrollPosition(window, window.scrollY);
      baseline();
      requestAnimationFrame(baseline);
    };
    apply();
    window.addEventListener("resize", apply);
    window.addEventListener("promptly:keyboard", apply);
    return () => {
      window.removeEventListener("resize", apply);
      window.removeEventListener("promptly:keyboard", apply);
    };
  }, [hidden, keyboardOpen]);

  const activeHref = (() => {
    if (pathname.startsWith("/language")) return "/account";
    if (pathname.startsWith("/notifications")) return "/";
    if (pathname.startsWith("/appearance")) return "/account";
    if (pathname.startsWith("/settings")) return "/account";
    if (pathname.startsWith("/tools")) return "/";
    return (
      primaryNavItems.find((item) =>
        item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
      )?.href ?? "/"
    );
  })();

  useEffect(() => {
    const tab = tabRefs.current[activeHref];
    const container = containerRef.current;
    if (!tab || !container) return;
    const tabRect = tab.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    setIndicator({
      left: tabRect.left - containerRect.left,
      width: tabRect.width,
    });
  }, [activeHref]);

  return (
    <nav
      ref={navRef}
      className="md:hidden fixed bottom-0 inset-x-0 z-50 px-3 phone-chrome-slide"
      style={{
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)",
        transform: hidden || keyboardOpen ? "translateY(120%)" : "translateY(0)",
      }}
    >
      <div
        ref={containerRef}
        className="relative flex items-stretch justify-center gap-1 rounded-[var(--radius-lg)] border border-border/80 px-2 py-1.5 card-shadow overflow-hidden mx-auto w-fit"
        style={{ background: "var(--surface-raised)" }}
      >
        {indicator && (
          <span
            className="absolute top-1.5 bottom-1.5 rounded-[var(--radius-md)] bg-accent-soft transition-[transform,width] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              width: indicator.width,
              transform: `translateX(${indicator.left}px)`,
              left: 0,
            }}
          />
        )}

        {primaryNavItems.map((item) => {
          const active = item.href === activeHref;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              ref={(el) => {
                tabRefs.current[item.href] = el;
              }}
              className="group relative z-10 flex flex-col items-center justify-center gap-0.5 w-14 py-2.5 rounded-[var(--radius-md)]"
            >
              <Icon
                className={cn(
                  "relative transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-active:scale-[0.92]",
                  active
                    ? "w-[19px] h-[19px] text-accent -translate-y-0.5"
                    : "w-[18px] h-[18px] text-muted-soft translate-y-0"
                )}
                weight={active ? "fill" : "regular"}
              />
              <span
                className={cn(
                  "relative text-[9.5px] font-medium transition-all duration-300",
                  active
                    ? "text-accent opacity-100 translate-y-0"
                    : "text-muted-soft opacity-80"
                )}
              >
                {NAV_LABEL_KEY[item.href] ? t(`nav.${NAV_LABEL_KEY[item.href]}`) : item.label}
              </span>
              <span
                className={cn(
                  "absolute -top-0.5 w-1 h-1 rounded-full bg-accent transition-all duration-300",
                  active ? "opacity-100 scale-100" : "opacity-0 scale-0"
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CaretRight } from "@/icons";
import { Card } from "@/components/card";
import { tracks } from "@/lib/tracks";
import { cn } from "@/lib/cn";
import { useI18n } from "@/components/locale-provider";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isPhoneCarousel() {
  return !window.matchMedia("(min-width: 768px)").matches;
}

function progressFromScroll(scroller: HTMLElement) {
  const cards = [...scroller.querySelectorAll<HTMLElement>("[data-track-card]")];
  if (cards.length < 2) return 0;
  const origin = scroller.getBoundingClientRect().left;
  const padding = Number.parseFloat(getComputedStyle(scroller).scrollPaddingInlineStart || getComputedStyle(scroller).paddingInlineStart) || 0;
  const target = origin + padding;
  const offsets = cards.map((card) => card.getBoundingClientRect().left - target);
  let i = 0;
  while (i < offsets.length - 1 && offsets[i + 1] <= 0) i += 1;
  if (i >= offsets.length - 1) return offsets.length - 1;
  const span = offsets[i + 1] - offsets[i];
  if (span === 0) return i;
  return i + Math.min(1, Math.max(0, -offsets[i] / span));
}

export function HomeTrackCarousel({ hero = false }: { hero?: boolean }) {
  const { t } = useI18n();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const activeRef = useRef(0);
  const holdUntilRef = useRef(0);
  const directionRef = useRef(1);
  const programmaticRef = useRef(false);
  const programmaticTimer = useRef(0);

  const active = Math.round(progress);

  const goTo = useCallback((index: number) => {
    const scroller = scrollerRef.current;
    const card = scroller?.querySelectorAll<HTMLElement>("[data-track-card]")[index];
    if (!scroller || !card) return;
    activeRef.current = index;
    programmaticRef.current = true;
    window.clearTimeout(programmaticTimer.current);
    programmaticTimer.current = window.setTimeout(() => {
      programmaticRef.current = false;
    }, 450);
    const left =
      card.getBoundingClientRect().left -
      scroller.getBoundingClientRect().left +
      scroller.scrollLeft;
    scroller.scrollTo({
      left,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, []);

  const pauseAuto = useCallback((ms = 8000) => {
    holdUntilRef.current = Date.now() + ms;
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const next = progressFromScroll(scroller);
        activeRef.current = Math.round(next);
        setProgress(next);
        if (!programmaticRef.current) pauseAuto();
      });
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [pauseAuto]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let startX = 0;
    let startY = 0;
    const onDown = (event: PointerEvent) => {
      startX = event.clientX;
      startY = event.clientY;
    };
    const onMove = (event: PointerEvent) => {
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (Math.abs(dx) < 10) return;
      if (Math.abs(dx) <= Math.abs(dy)) return;
      programmaticRef.current = false;
      pauseAuto();
    };
    scroller.addEventListener("pointerdown", onDown);
    scroller.addEventListener("pointermove", onMove);
    return () => {
      scroller.removeEventListener("pointerdown", onDown);
      scroller.removeEventListener("pointermove", onMove);
    };
  }, [pauseAuto]);

  useEffect(() => {
    const tick = () => {
      if (!isPhoneCarousel() || prefersReducedMotion()) return;
      if (document.hidden) return;
      if (Date.now() < holdUntilRef.current) return;
      if (tracks.length < 2) return;
      const last = tracks.length - 1;
      let next = activeRef.current + directionRef.current;
      if (next > last) {
        directionRef.current = -1;
        next = last - 1;
      } else if (next < 0) {
        directionRef.current = 1;
        next = 1;
      }
      goTo(next);
    };

    const id = window.setInterval(tick, 2500);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(programmaticTimer.current);
    };
  }, [goTo]);

  return (
    <div>
      <div
        className={cn(
          "items-end justify-between mb-3 md:mb-5 px-0.5",
          hero ? "hidden md:flex" : "flex"
        )}
      >
        <h2 className="text-[15px] font-semibold">{t("home.domainTracks")}</h2>
        <Link
          href="/tracks"
          className="text-[13px] text-muted flex items-center hover:text-foreground transition-colors"
        >
          {t("home.seeAll")} <CaretRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div
        ref={scrollerRef}
        className="home-track-scroller home-track-preview -mx-4 md:mx-0 px-4 md:px-0"
        tabIndex={0}
        aria-roledescription="carousel"
        aria-label={t("home.domainTracks")}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            pauseAuto();
            goTo(Math.min(active + 1, tracks.length - 1));
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            pauseAuto();
            goTo(Math.max(active - 1, 0));
          }
        }}
      >
        {tracks.map((track, i) => {
          const Icon = track.icon;
          const name = t(`tracks.${track.slug}.name`);
          const blurb = t(`tracks.${track.slug}.blurb`);
          return (
            <Link
              key={track.slug}
              id={`home-track-${track.slug}`}
              href={`/tracks/${track.slug}`}
              data-track-card
              className="home-track-card"
              aria-label={`${name}. ${blurb}`}
            >
              <Card className={cn(
                "relative h-full overflow-hidden p-0 active:scale-[0.99] md:active:scale-100 transition-transform pc-lift",
                hero ? "min-h-[200px] md:min-h-[176px]" : "min-h-[168px]"
              )}>
                <div className={cn("relative z-[1] flex h-full", hero ? "min-h-[200px] md:min-h-[176px]" : "min-h-[168px]")}>
                  <div className="flex flex-1 flex-col justify-between p-5 md:p-6 pr-4 min-w-0">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
                        {t("home.trackN", { n: i + 1 })}
                      </p>
                      <p className={cn(
                        "mt-2 font-semibold tracking-tight leading-snug text-pretty",
                        hero ? "text-[20px] md:text-[18px]" : "text-[20px]"
                      )}>
                        {name}
                      </p>
                      <p className="mt-1.5 text-[13.5px] leading-snug text-muted max-w-[18rem] md:max-w-none">
                        {blurb}
                      </p>
                    </div>
                    <p className="mt-5 text-[12.5px] text-muted tabular-nums">
                      {t("home.scenarios", { n: track.lessons })}
                    </p>
                  </div>
                  <div className="home-track-art relative w-[34%] md:w-[26%] min-w-[5.5rem] md:min-w-[5rem] shrink-0" aria-hidden="true">
                    <Icon className={cn(
                      "home-track-glyph text-accent",
                      hero ? "h-14 w-14 md:h-11 md:w-11" : "h-14 w-14"
                    )} />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-2.5 flex md:hidden items-center justify-center gap-3">
        <div className="flex items-center" role="group" aria-label="Jump to a track">
          {tracks.map((track, i) => {
            const closeness = Math.max(0, 1 - Math.abs(progress - i));
            return (
              <button
                key={track.slug}
                type="button"
                aria-label={`Show ${track.name}`}
                aria-current={i === active ? "true" : undefined}
                aria-controls={`home-track-${track.slug}`}
                onClick={() => {
                  pauseAuto();
                  goTo(i);
                }}
                className="flex h-6 w-5 items-center justify-center p-0"
              >
                <span
                  className="block h-1.5 rounded-full"
                  style={{
                    width: 6 + 14 * closeness,
                    background: `color-mix(in srgb, var(--accent) ${Math.round(closeness * 100)}%, var(--border))`,
                  }}
                />
              </button>
            );
          })}
        </div>
        {hero && (
          <Link
            href="/tracks"
            className="text-[12.5px] text-muted flex items-center hover:text-foreground transition-colors"
          >
            See all <CaretRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

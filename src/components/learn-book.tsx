"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, CaretLeft, CaretRight } from "@/icons";
import { LearnSheet } from "@/components/learn-sheet";
import { learnLessons, markLearnLessonSeen } from "@/lib/learn";
import { cn } from "@/lib/cn";

const FLIP_MS = 920;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function LearnBook({ slug }: { slug: string }) {
  const router = useRouter();
  const index = Math.max(0, learnLessons.findIndex((lesson) => lesson.slug === slug));
  const target = learnLessons[index] ?? learnLessons[0];

  const [frontIndex, setFrontIndex] = useState(index);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [flip, setFlip] = useState<{
    to: number;
    direction: "forward" | "back";
    turned: boolean;
  } | null>(null);

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const finishTimer = useRef<number | null>(null);

  const front = learnLessons[frontIndex];
  const incoming = flip ? learnLessons[flip.to] : front;
  const busy = Boolean(flip) || pendingSlug !== null;

  useEffect(() => {
    markLearnLessonSeen(target.slug);
  }, [target.slug]);

  useEffect(() => {
    if (target.slug === pendingSlug) setPendingSlug(null);
  }, [pendingSlug, target.slug]);

  const settle = useCallback((to: number) => {
    setFrontIndex(to);
    setFlip(null);
  }, []);

  const beginFlip = useCallback(
    (to: number) => {
      if (to === frontIndex || to < 0 || to >= learnLessons.length) return;
      if (flip) return;

      const direction = to > frontIndex ? "forward" : "back";

      if (prefersReducedMotion()) {
        setFrontIndex(to);
        return;
      }

      setFlip({ to, direction, turned: false });
    },
    [flip, frontIndex]
  );

  useEffect(() => {
    if (index === frontIndex || flip) return;
    beginFlip(index);
  }, [beginFlip, flip, frontIndex, index]);

  useEffect(() => {
    if (!flip || flip.turned) return;
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setFlip((current) => (current ? { ...current, turned: true } : current));
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [flip]);

  useEffect(() => {
    if (!flip?.turned) return;
    finishTimer.current = window.setTimeout(() => settle(flip.to), FLIP_MS);
    return () => {
      if (finishTimer.current) window.clearTimeout(finishTimer.current);
    };
  }, [flip, settle]);

  const goTo = (to: number) => {
    const lesson = learnLessons[to];
    if (!lesson || busy) return;
    setPendingSlug(lesson.slug);
    router.push(`/learn/${lesson.slug}`, { scroll: false });
  };

  const onTouchStart = (event: React.TouchEvent) => {
    const touch = event.changedTouches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || busy) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    if (dx < 0) goTo(frontIndex + 1);
    else goTo(frontIndex - 1);
  };

  const prev = learnLessons[frontIndex - 1];
  const next = learnLessons[frontIndex + 1];

  return (
      <div className="learn-book-frame mx-auto max-w-3xl px-4 pb-8 pt-5 md:px-8 md:pt-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link href="/learn" className="inline-flex items-center gap-1.5 text-[13px] text-muted">
          <CaretLeft className="h-3.5 w-3.5" />
          Contents
        </Link>
        <p className="text-[12px] text-muted">
          {frontIndex + 1} / {learnLessons.length}
        </p>
      </div>

      <div
        className="learn-book"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="learn-book-spine" aria-hidden="true" />
        <div className="learn-book-edges" aria-hidden="true" />

        <div
          className={cn(
            "learn-book-stage",
            flip && "is-flipping",
            flip?.direction === "back" && "is-back"
          )}
        >
          <div className="learn-page learn-page-under">
            <LearnSheet
              lesson={incoming}
              index={flip ? flip.to : frontIndex}
              total={learnLessons.length}
            />
          </div>

          {flip && (
            <div
              className={cn(
                "learn-flipper",
                flip.direction === "forward" ? "flip-forward" : "flip-back",
                flip.turned && "is-turned"
              )}
            >
              <div className="learn-face learn-face-front">
                <LearnSheet lesson={front} index={frontIndex} total={learnLessons.length} />
              </div>
              <div className="learn-face learn-face-back" aria-hidden="true">
                <div className="learn-verso">
                  <BookOpen className="h-7 w-7 text-accent/50" />
                  <p className="mt-3 text-[12px] uppercase tracking-[0.18em] text-muted">
                    Promptly handbook
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-1.5 px-1">
        {learnLessons.map((lesson, i) => (
          <button
            key={lesson.slug}
            type="button"
            aria-label={`Open ${lesson.title}`}
            aria-current={i === frontIndex ? "page" : undefined}
            disabled={busy}
            onClick={() => goTo(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === frontIndex ? "w-6 bg-accent" : "w-1.5 bg-border"
            )}
          />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {prev ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => goTo(frontIndex - 1)}
            className="flex items-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-3.5 py-3.5 text-left active:scale-[0.98] disabled:opacity-50"
          >
            <CaretLeft className="h-4 w-4 shrink-0 text-muted" />
            <span className="min-w-0">
              <span className="block text-[11px] text-muted">Previous</span>
              <span className="block truncate text-[13.5px] font-medium">{prev.title}</span>
            </span>
          </button>
        ) : (
          <span />
        )}

        {next ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => goTo(frontIndex + 1)}
            className="col-start-2 flex items-center justify-end gap-2 rounded-[var(--radius-md)] bg-accent px-3.5 py-3.5 text-right text-accent-foreground active:scale-[0.98] disabled:opacity-50"
          >
            <span className="min-w-0">
              <span className="block text-[11px] opacity-80">Next lesson</span>
              <span className="block truncate text-[13.5px] font-medium">{next.title}</span>
            </span>
            <CaretRight className="h-4 w-4 shrink-0" />
          </button>
        ) : (
          <Link
            href="/learn"
            className="col-start-2 flex items-center justify-end gap-2 rounded-[var(--radius-md)] bg-accent px-3.5 py-3.5 text-right text-accent-foreground"
          >
            <span>
              <span className="block text-[11px] opacity-80">Handbook</span>
              <span className="block text-[13.5px] font-medium">Back to contents</span>
            </span>
            <BookOpen className="h-4 w-4 shrink-0" />
          </Link>
        )}
      </div>
    </div>
  );
}

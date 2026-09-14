"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, CaretRight, Check } from "@/icons";
import { getSeenLearnSlugs, learnLessons } from "@/lib/learn";
import { StaggerGroup, StaggerItem } from "@/components/stagger-group";
import { cn } from "@/lib/cn";

export function LearnIndex() {
  const [seen] = useState(() =>
    typeof window === "undefined" ? [] : getSeenLearnSlugs()
  );
  const readCount = seen.filter((slug) => learnLessons.some((lesson) => lesson.slug === slug)).length;
  const firstUnread = learnLessons.find((lesson) => !seen.includes(lesson.slug)) ?? learnLessons[0];

  return (
    <div className="mx-auto max-w-3xl px-4 pb-8 pt-6 md:px-8 md:pt-10">
      <div className="learn-cover overflow-hidden rounded-[var(--radius-lg)] border border-border">
        <div className="learn-cover-spine" aria-hidden="true" />
        <div className="relative px-5 py-6 md:px-7 md:py-7">
          <div className="flex items-center gap-2 text-accent">
            <BookOpen className="h-[18px] w-[18px]" weight="fill" />
            <p className="text-[11px] font-medium uppercase tracking-[0.16em]">Handbook</p>
          </div>
          <h1 className="mt-3 text-[26px] font-semibold tracking-tight md:text-[28px]">
            Seven habits for talking to AI
          </h1>
          <p className="mt-2 max-w-md text-[14px] leading-relaxed text-muted">
            Short chapters you can read in a sitting. Each one is a page in the same book. Turn
            it, don&apos;t jump.
          </p>
          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-[12.5px] text-muted">
              {readCount} of {learnLessons.length} chapters opened
            </p>
            <Link
              href={`/learn/${firstUnread.slug}`}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-accent px-3.5 py-2 text-[13px] font-medium text-accent-foreground"
            >
              {readCount === 0 ? "Open the book" : "Continue"}
              <CaretRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <h2 className="mt-8 mb-3 text-[13px] font-medium uppercase tracking-[0.14em] text-muted">
        Contents
      </h2>

      <StaggerGroup className="flex flex-col">
        {learnLessons.map((lesson, i) => {
          const opened = seen.includes(lesson.slug);
          return (
            <StaggerItem key={lesson.slug}>
              <Link
                href={`/learn/${lesson.slug}`}
                className="learn-toc-row flex items-baseline gap-3 py-3.5"
              >
                <span
                  className={cn(
                    "w-7 shrink-0 text-[13px] tabular-nums",
                    opened ? "text-accent" : "text-muted"
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-[15px] font-medium">{lesson.title}</span>
                    {opened && <Check className="h-3.5 w-3.5 shrink-0 text-accent" />}
                  </span>
                  <span className="mt-0.5 block text-[12.5px] leading-snug text-muted">
                    {lesson.summary}
                  </span>
                </span>
              </Link>
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </div>
  );
}

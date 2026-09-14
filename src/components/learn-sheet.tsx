import { Check, X } from "@/icons";
import type { LearnLesson } from "@/lib/learn";

export function LearnSheet({
  lesson,
  index,
  total,
}: {
  lesson: LearnLesson;
  index: number;
  total: number;
}) {
  return (
    <article className="learn-sheet-paper relative px-5 py-6 md:px-8 md:py-8">
      <p
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-3 select-none text-[72px] font-semibold leading-none text-accent/10"
      >
        {index + 1}
      </p>

      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
        Chapter {index + 1} · {total} in the handbook
      </p>
      <h1 className="mt-2 max-w-[18ch] text-[26px] font-semibold tracking-tight leading-[1.15] md:text-[30px]">
        {lesson.title}
      </h1>
      <p className="mt-3 text-[14.5px] leading-relaxed text-muted">{lesson.summary}</p>

      <div className="learn-sheet-rule mt-5 mb-5" />

      <p className="text-[15px] leading-[1.7]">{lesson.explanation}</p>

      <div className="mt-6 flex flex-col gap-3.5">
        <figure className="learn-quote learn-quote-weak">
          <figcaption className="flex items-center gap-2 mb-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--danger)_16%,transparent)]">
              <X className="h-3 w-3 text-danger" />
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
              Weak prompt
            </span>
          </figcaption>
          <blockquote className="text-[14.5px] leading-relaxed">{lesson.badExample}</blockquote>
        </figure>

        <figure className="learn-quote learn-quote-strong">
          <figcaption className="flex items-center gap-2 mb-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-soft">
              <Check className="h-3 w-3 text-accent" />
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
              Strong prompt
            </span>
          </figcaption>
          <blockquote className="text-[14.5px] leading-relaxed">{lesson.goodExample}</blockquote>
        </figure>
      </div>

      <aside className="learn-margin-note mt-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-accent">Why it works</p>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{lesson.whyItWorks}</p>
      </aside>
    </article>
  );
}

"use client";

import { useParams } from "next/navigation";
import { LearnBook } from "@/components/learn-book";
import { learnLessons } from "@/lib/learn";

export default function LearnLessonLayout({ children }: { children: React.ReactNode }) {
  const slug = String(useParams().slug ?? "");
  if (!learnLessons.some((lesson) => lesson.slug === slug)) return children;
  return (
    <>
      <LearnBook slug={slug} />
      <div className="hidden">{children}</div>
    </>
  );
}

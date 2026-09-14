import { notFound } from "next/navigation";
import { learnLessons } from "@/lib/learn";

export default async function LearnLessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!learnLessons.some((lesson) => lesson.slug === slug)) notFound();
  return null;
}

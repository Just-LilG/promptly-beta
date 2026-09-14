import Link from "next/link";
import { notFound } from "next/navigation";
import { CaretLeft } from "@/icons";
import { tracks } from "@/lib/tracks";
import { getScenario, getTrackScenarios } from "@/lib/scenarios";
import { ScenarioClient } from "@/components/scenario-client";

export default async function ScenarioPage({
  params,
}: {
  params: Promise<{ slug: string; scenario: string }>;
}) {
  const { slug, scenario: scenarioSlug } = await params;
  const track = tracks.find((t) => t.slug === slug);
  const scenario = getScenario(slug, scenarioSlug);
  if (!track || !scenario) notFound();

  const all = getTrackScenarios(slug);
  const index = all.findIndex((s) => s.slug === scenarioSlug);
  const next = all[index + 1];

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 pt-6 md:pt-10 pb-8">
      <Link
        href={`/tracks/${slug}`}
        className="inline-flex items-center gap-1 text-[13px] text-muted mb-4"
      >
        <CaretLeft className="w-3.5 h-3.5" />
        {track.name}
      </Link>

      <p className="text-[12px] font-medium text-muted uppercase tracking-wide">
        Scenario {index + 1} of {all.length}
      </p>
      <h1 className="text-[20px] md:text-[22px] font-semibold tracking-tight mt-1 mb-5">
        {scenario.title}
      </h1>

      <ScenarioClient
        trackSlug={slug}
        scenarioSlug={scenarioSlug}
        nextHref={next ? `/tracks/${slug}/${next.slug}` : undefined}
        nextTitle={next?.title}
        doneHref="/tracks"
        doneLabel="Pick another track"
      />
    </div>
  );
}

import { notFound } from "next/navigation";
import { Card } from "@/components/card";
import { tracks } from "@/lib/tracks";
import { getTrackScenarios } from "@/lib/scenarios";
import { TrackScenarioList } from "@/components/track-scenario-list";
import { TrackIcon } from "@/components/track-icon";

export default async function TrackPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const track = tracks.find((t) => t.slug === slug);
  if (!track) notFound();

  const scenarios = getTrackScenarios(slug);
  const scenarioSummaries = scenarios.map((s) => ({ slug: s.slug, title: s.title }));

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 pt-6 md:pt-10">
      <div className="flex items-start gap-3.5">
        <TrackIcon track={track} />
        <div className="min-w-0">
          <h1 className="text-[21px] font-semibold tracking-tight">{track.name}</h1>
          <p className="text-muted text-[13.5px] mt-0.5">{track.blurb}</p>
        </div>
      </div>

      {scenarios.length > 0 && (
        <Card className="p-4 mt-5">
          <p className="text-[13.5px] leading-relaxed text-muted">{track.intro}</p>
        </Card>
      )}

      <TrackScenarioList key={slug} trackSlug={slug} scenarios={scenarioSummaries} />
    </div>
  );
}

import { PracticeClient } from "@/components/practice-client";
import { getTrackScenarios } from "@/lib/scenarios";

export default function PracticePage() {
  const scenarios = getTrackScenarios("practice").map((s) => ({ slug: s.slug, title: s.title, goal: s.goal }));
  return <PracticeClient scenarios={scenarios} />;
}

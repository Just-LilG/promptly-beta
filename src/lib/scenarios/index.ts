import type { Scenario } from "./types";
import { codingScenarios } from "./coding";
import { designScenarios } from "./design";
import { writingScenarios } from "./writing";
import { researchScenarios } from "./research";
import { businessScenarios } from "./business";
import { everydayScenarios } from "./everyday";
import { automationScenarios } from "./automation";
import { practiceScenarios } from "./practice";

export const scenariosByTrack: Record<string, Scenario[]> = {
  coding: codingScenarios,
  design: designScenarios,
  writing: writingScenarios,
  research: researchScenarios,
  business: businessScenarios,
  everyday: everydayScenarios,
  automation: automationScenarios,
  practice: practiceScenarios,
};

export function getTrackScenarios(trackSlug: string): Scenario[] {
  return scenariosByTrack[trackSlug] ?? [];
}

export function getScenario(trackSlug: string, scenarioSlug: string): Scenario | undefined {
  return getTrackScenarios(trackSlug).find((s) => s.slug === scenarioSlug);
}

export { type Scenario, evaluateScenario, type ScenarioResult } from "./types";

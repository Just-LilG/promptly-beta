export type CheckRule = {
  id: string;
  label: string; // shown in feedback, e.g. "Mentioned the error message"
  test: (prompt: string) => boolean;
  weight: number; // contributes to score out of 100
  hintIfMissing: string; // shown when the rule fails
};

export type Scenario = {
  slug: string;
  trackSlug: string;
  title: string;
  goal: string; // what the user is trying to accomplish
  context?: {
    label: string; // e.g. "Buggy code"
    content: string; // code block / error text shown to the user
    language?: string;
  };
  rules: CheckRule[];
  // Generates the simulated AI's reply based on which rules passed.
  simulateResponse: (prompt: string, passed: CheckRule[]) => string;
};

export type ScenarioResult = {
  score: number; // 0-100
  passed: CheckRule[];
  failed: CheckRule[];
  aiResponse: string;
};

export function evaluateScenario(scenario: Scenario, prompt: string): ScenarioResult {
  const passed: CheckRule[] = [];
  const failed: CheckRule[] = [];

  for (const rule of scenario.rules) {
    if (rule.test(prompt)) {
      passed.push(rule);
    } else {
      failed.push(rule);
    }
  }

  const totalWeight = scenario.rules.reduce((sum, r) => sum + r.weight, 0);
  const earnedWeight = passed.reduce((sum, r) => sum + r.weight, 0);
  const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

  const aiResponse = scenario.simulateResponse(prompt, passed);

  return { score, passed, failed, aiResponse };
}

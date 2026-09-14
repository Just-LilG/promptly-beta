import { COACH_SYSTEM_PROMPT, PLAIN_SYSTEM_PROMPT } from "@/lib/tutor-persona";

export type ModuleId = "coach" | "plain" | "critic" | "rewriter";

export type AgentModule = {
  id: ModuleId;
  name: string;
  description: string;
  systemPrompt: string;
};

const CRITIC_SYSTEM_PROMPT = `You are a strict prompt critic. Your only job is to find weaknesses in the prompt the user gives you. Never answer it, and never rewrite it yourself.

Never use em dashes. Use commas, periods, or a simple hyphen.

Rules:
- Respond with a short, blunt list of concrete weaknesses (missing context, no audience, no format/length constraint, ambiguous wording, contradictions). 2-4 bullets, most important first.
- Do not soften with unrelated praise. If the prompt is genuinely strong, say so in one line instead of inventing flaws.
- Never write a rewritten version. That's a different agent's job. Stay in your lane: find problems, don't fix them.
- Keep the whole response under 80 words.`;

const REWRITER_SYSTEM_PROMPT = `You are a prompt rewriter. You take a prompt and a list of its weaknesses (both given to you) and produce ONE improved version.

Never use em dashes. Use commas, periods, or a simple hyphen.

Rules:
- Output ONLY the rewritten prompt. No preamble, no explanation, no "Here's a better version:".
- Address every weakness you were given, concretely.
- Don't invent a different task than the one implied by the original prompt.
- If no weaknesses were given, lightly tighten the prompt without changing its intent.`;

export const AGENT_MODULES: AgentModule[] = [
  {
    id: "coach",
    name: "Coach",
    description: "Reviews your prompt and suggests one concrete improvement at a time.",
    systemPrompt: COACH_SYSTEM_PROMPT,
  },
  {
    id: "plain",
    name: "Plain",
    description: "Responds literally to exactly what you wrote. No gap-filling.",
    systemPrompt: PLAIN_SYSTEM_PROMPT,
  },
  {
    id: "critic",
    name: "Critic",
    description: "Only finds weaknesses. Pairs with Rewriter in Pipeline mode.",
    systemPrompt: CRITIC_SYSTEM_PROMPT,
  },
  {
    id: "rewriter",
    name: "Rewriter",
    description: "Only rewrites. Takes weaknesses in and produces an improved prompt.",
    systemPrompt: REWRITER_SYSTEM_PROMPT,
  },
];

export function getModule(id: ModuleId): AgentModule {
  return AGENT_MODULES.find((m) => m.id === id) ?? AGENT_MODULES[0];
}

// The Pipeline runs Critic then Rewriter in sequence on the same input,
// automatically — genuine multi-agent behavior (two different personas
// handing off work) rather than a single model wearing two hats in one
// call. Both steps currently run against the one configured cloud provider;
// each step is its own independent request, so a second real provider could
// be swapped in per-step later without changing this shape.
export const PIPELINE_STEPS: ModuleId[] = ["critic", "rewriter"];

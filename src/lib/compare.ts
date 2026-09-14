export type ImprovementNote = {
  issue: string;
  fix: string;
};

export type CompareResult = {
  rewritten: string;
  notes: ImprovementNote[];
};

const mentions = (prompt: string, ...words: string[]) => {
  const p = prompt.toLowerCase();
  return words.some((w) => p.includes(w.toLowerCase()));
};
const wordCount = (prompt: string) => prompt.trim().split(/\s+/).filter(Boolean).length;

// A lightweight, rule-based "rewrite" — not a real generative rewrite, but a
// genuinely useful structural upgrade: it detects common weaknesses and shows
// what a stronger version would add, so the person sees concrete before/after
// structure rather than a black-box AI rewrite.
export function improvePrompt(original: string): CompareResult {
  const trimmed = original.trim();
  const notes: ImprovementNote[] = [];
  const additions: string[] = [];

  if (wordCount(trimmed) <= 6) {
    notes.push({
      issue: "Very short, likely underspecified",
      fix: "Add who this is for, what format you want, and any length limit.",
    });
    additions.push("[Add: who this is for / what it's used for]");
  }

  if (!mentions(trimmed, "word", "sentence", "paragraph", "bullet", "short", "long", "brief")) {
    notes.push({
      issue: "No length or format constraint",
      fix: "State a length (e.g. \"under 100 words\") or format (bullets vs. prose).",
    });
    additions.push("[Add: desired length or format]");
  }

  if (!mentions(trimmed, "for a", "for my", "audience", "reader", "someone who")) {
    notes.push({
      issue: "No stated audience",
      fix: "Say who this is for. The right tone and depth depend heavily on that.",
    });
    additions.push("[Add: intended audience]");
  }

  if (
    mentions(trimmed, "better", "nice", "good", "improve") &&
    !mentions(trimmed, "specifically", "because", "so that")
  ) {
    notes.push({
      issue: "\"Better/nice/good\" is undefined",
      fix: "Say specifically what \"better\" means here: faster, clearer, more formal, higher-converting, etc.",
    });
    additions.push("[Clarify: what does 'better' mean here, specifically?]");
  }

  const hasContradiction =
    (mentions(trimmed, "brief") && mentions(trimmed, "detailed", "comprehensive", "thorough")) ||
    (mentions(trimmed, "casual") && mentions(trimmed, "formal"));
  if (hasContradiction) {
    notes.push({
      issue: "Contains a contradiction (e.g. \"brief but detailed\")",
      fix: "Decide which goal wins and say so. The AI can't satisfy both at once.",
    });
    additions.push("[Resolve: pick one. Brevity or thoroughness, not both]");
  }

  if (notes.length === 0) {
    notes.push({
      issue: "Nothing major missing",
      fix: "This prompt already includes good specifics. Minor polish only.",
    });
  }

  const rewritten =
    additions.length > 0
      ? `${trimmed}\n\n${additions.join("\n")}`
      : trimmed;

  return { rewritten, notes };
}

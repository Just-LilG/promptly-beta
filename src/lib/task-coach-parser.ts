export type TaskCoachResult = {
  verdict: string;
  strong: string[];
  needsWork: string[];
  rewrite: string;
};

// Parses the structured VERDICT/STRONG/NEEDS WORK/REWRITE format the task-coach
// persona is instructed to always respond in. Falls back gracefully if the model
// doesn't follow the format exactly — small local models don't always comply
// perfectly, so this degrades to showing raw text rather than breaking.
export function parseTaskCoachResponse(raw: string): TaskCoachResult | null {
  const verdictMatch = raw.match(/VERDICT:\s*(.+)/i);
  const strongMatch = raw.match(/STRONG:\s*([\s\S]*?)(?=NEEDS WORK:|REWRITE:|$)/i);
  const needsWorkMatch = raw.match(/NEEDS WORK:\s*([\s\S]*?)(?=REWRITE:|$)/i);
  const rewriteMatch = raw.match(/REWRITE:\s*([\s\S]*)/i);

  if (!verdictMatch) return null;

  const parseBullets = (block: string | undefined): string[] => {
    if (!block) return [];
    return block
      .split("\n")
      .map((line) => line.replace(/^[\s-]*/, "").trim())
      .filter(Boolean);
  };

  return {
    verdict: verdictMatch[1].trim(),
    strong: parseBullets(strongMatch?.[1]),
    needsWork: parseBullets(needsWorkMatch?.[1]),
    rewrite: rewriteMatch?.[1]?.trim() ?? "",
  };
}

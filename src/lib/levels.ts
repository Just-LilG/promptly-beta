export const LEVELS = [
  { count: 0, label: "Just starting" },
  { count: 1, label: "First Steps" },
  { count: 10, label: "Building Habits" },
  { count: 25, label: "Prompt Practitioner" },
  { count: 50, label: "Prompt Master" },
] as const;

export function describeLevel(completed: number) {
  const current = [...LEVELS].reverse().find((level) => completed >= level.count) ?? LEVELS[0];
  const next = LEVELS.find((level) => completed < level.count);
  const span = next ? next.count - current.count : 1;
  const into = completed - current.count;
  const percent = next ? Math.min(100, Math.round((into / span) * 100)) : 100;

  return {
    completed,
    currentLabel: current.label,
    nextLabel: next?.label ?? null,
    remaining: next ? next.count - completed : 0,
    percent,
  };
}

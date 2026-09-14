export const THEME_KEY = "promptly:theme";

export type ThemeChoice = "light" | "dark" | "system";

export function isThemeChoice(value: string | null): value is ThemeChoice {
  return value === "light" || value === "dark" || value === "system";
}

export function readThemeChoice(): ThemeChoice {
  if (typeof window === "undefined") return "system";
  try {
    const raw = window.localStorage.getItem(THEME_KEY);
    return isThemeChoice(raw) ? raw : "system";
  } catch {
    return "system";
  }
}

export function osPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolvedTheme(choice: ThemeChoice): "light" | "dark" {
  if (choice === "system") return osPrefersDark() ? "dark" : "light";
  return choice;
}

export function applyThemeChoice(choice: ThemeChoice) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", choice);
  const resolved = resolvedTheme(choice);
  document.documentElement.style.colorScheme = resolved;
  const color = resolved === "dark" ? "#111312" : "#fafaf9";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", color);
}

export function persistThemeChoice(choice: ThemeChoice) {
  try {
    window.localStorage.setItem(THEME_KEY, choice);
  } catch {
    // storage blocked
  }
  applyThemeChoice(choice);
}

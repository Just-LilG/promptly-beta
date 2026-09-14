const STORAGE_KEY = "promptly:ai-engine";

export type AIEngine = "local" | "api";

export function getAIEnginePreference(): AIEngine {
  if (typeof window === "undefined") return "local";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === "api" ? "api" : "local";
  } catch {
    return "local";
  }
}

export function setAIEnginePreference(engine: AIEngine) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, engine);
  } catch {
    // storage unavailable — preference just won't persist across sessions
  }
}

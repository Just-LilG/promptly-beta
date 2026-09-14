import { en, type Messages } from "./en";
import { zh } from "./zh";
import { es } from "./es";
import { ar } from "./ar";
import { hi } from "./hi";
import { pt } from "./pt";
import { id } from "./id";
import { ja } from "./ja";
import { ru } from "./ru";
import { fr } from "./fr";
import { de } from "./de";
import { ko } from "./ko";
import { isLocale, isRtlLocale, type Locale } from "./locales";

export { LOCALES, LOCALE_META, LOCALE_STORAGE_KEY, isLocale, isRtlLocale } from "./locales";
export type { Locale } from "./locales";
export type { Messages };

export const dictionaries: Record<Locale, Messages> = {
  en,
  zh,
  es,
  ar,
  hi,
  pt,
  id,
  ja,
  ru,
  fr,
  de,
  ko,
};

export const NAV_LABEL_KEY: Record<string, keyof Messages["nav"]> = {
  "/": "home",
  "/learn": "learn",
  "/sandbox": "sandbox",
  "/tools": "tools",
  "/tracks": "tracks",
  "/progress": "progress",
  "/task-coach": "taskCoach",
  "/library": "library",
  "/practice": "practice",
  "/compare": "compare",
  "/reference": "reference",
  "/workflows": "workflows",
  "/notifications": "notifications",
  "/account": "account",
};

export const NAV_BLURB_KEY: Record<string, keyof Messages["navBlurb"]> = {
  "/tracks": "tracks",
  "/progress": "progress",
  "/task-coach": "taskCoach",
  "/library": "library",
  "/practice": "practice",
  "/compare": "compare",
  "/reference": "reference",
  "/workflows": "workflows",
  "/notifications": "notifications",
};

type Vars = Record<string, string | number>;

export function translate(messages: Messages, key: string, vars?: Vars): string {
  const parts = key.split(".");
  let node: unknown = messages;
  for (const part of parts) {
    if (typeof node !== "object" || node === null || !(part in node)) {
      return key;
    }
    node = (node as Record<string, unknown>)[part];
  }
  if (typeof node !== "string") return key;
  if (!vars) return node;
  return node.replace(/\{(\w+)\}/g, (_, name: string) =>
    vars[name] === undefined ? `{${name}}` : String(vars[name])
  );
}

export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const list = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of list) {
    const lower = tag.toLowerCase().replace("_", "-");
    const primary = lower.split("-")[0];
    if (primary === "zh") return "zh";
    if (isLocale(primary)) return primary;
  }
  return "en";
}

export function readStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("promptly:locale");
    return isLocale(raw) ? raw : null;
  } catch {
    return null;
  }
}

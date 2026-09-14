export const LOCALES = [
  "en",
  "zh",
  "es",
  "ar",
  "hi",
  "pt",
  "id",
  "ja",
  "ru",
  "fr",
  "de",
  "ko",
] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_STORAGE_KEY = "promptly:locale";

export const RTL_LOCALES: readonly Locale[] = ["ar"];

export const LOCALE_META: Record<
  Locale,
  { nativeName: string; englishName: string; search: string }
> = {
  en: { nativeName: "English", englishName: "English", search: "english united states america us usa" },
  zh: { nativeName: "中文", englishName: "Chinese", search: "chinese china zhongwen" },
  es: { nativeName: "Español", englishName: "Spanish", search: "spanish spain espanol" },
  ar: { nativeName: "العربية", englishName: "Arabic", search: "arabic saudi arabia" },
  hi: { nativeName: "हिन्दी", englishName: "Hindi", search: "hindi india bharat" },
  pt: { nativeName: "Português", englishName: "Portuguese", search: "portuguese brazil brasil" },
  id: { nativeName: "Bahasa Indonesia", englishName: "Indonesian", search: "indonesian indonesia" },
  ja: { nativeName: "日本語", englishName: "Japanese", search: "japanese japan nihongo" },
  ru: { nativeName: "Русский", englishName: "Russian", search: "russian russia" },
  fr: { nativeName: "Français", englishName: "French", search: "french france francais" },
  de: { nativeName: "Deutsch", englishName: "German", search: "german germany deutschland" },
  ko: { nativeName: "한국어", englishName: "Korean", search: "korean korea hangul" },
};

export function isLocale(value: string | null | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function isRtlLocale(value: Locale): boolean {
  return RTL_LOCALES.includes(value);
}

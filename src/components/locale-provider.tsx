"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  dictionaries,
  detectBrowserLocale,
  isRtlLocale,
  readStoredLocale,
  translate,
  type Locale,
  type Messages,
} from "@/lib/i18n";
import { LOCALE_STORAGE_KEY } from "@/lib/i18n/locales";

type TFn = (key: string, vars?: Record<string, string | number>) => string;

const LocaleContext = createContext<{
  locale: Locale;
  usesDeviceLocale: boolean;
  setLocale: (locale: Locale) => void;
  useDeviceLocale: () => void;
  t: TFn;
  messages: Messages;
} | null>(null);

function applyDocumentLocale(next: Locale) {
  document.documentElement.lang = next;
  document.documentElement.dir = isRtlLocale(next) ? "rtl" : "ltr";
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() =>
    typeof window === "undefined" ? "en" : (readStoredLocale() ?? detectBrowserLocale())
  );
  const [usesDeviceLocale, setUsesDeviceLocale] = useState(
    () => typeof window === "undefined" || !readStoredLocale()
  );

  useEffect(() => {
    const stored = readStoredLocale();
    setUsesDeviceLocale(!stored);
    setLocaleState(stored ?? detectBrowserLocale());
  }, []);

  useEffect(() => {
    applyDocumentLocale(locale);
  }, [locale]);

  useEffect(() => {
    const onLang = () => {
      if (readStoredLocale()) return;
      setLocaleState(detectBrowserLocale());
    };
    window.addEventListener("languagechange", onLang);
    return () => window.removeEventListener("languagechange", onLang);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setUsesDeviceLocale(false);
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // storage full or blocked
    }
    applyDocumentLocale(next);
  }, []);

  const useDeviceLocale = useCallback(() => {
    setUsesDeviceLocale(true);
    try {
      window.localStorage.removeItem(LOCALE_STORAGE_KEY);
    } catch {
      // storage blocked
    }
    const next = detectBrowserLocale();
    setLocaleState(next);
    applyDocumentLocale(next);
  }, []);

  const messages = dictionaries[locale];
  const t = useCallback<TFn>(
    (key, vars) => translate(messages, key, vars),
    [messages]
  );

  const value = useMemo(
    () => ({ locale, usesDeviceLocale, setLocale, useDeviceLocale, t, messages }),
    [locale, usesDeviceLocale, setLocale, useDeviceLocale, t, messages]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside LocaleProvider");
  }
  return ctx;
}

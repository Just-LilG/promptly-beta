"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CaretLeft, Check, DeviceMobile, MagnifyingGlass } from "@/icons";
import { Card } from "@/components/card";
import { LocaleFlag } from "@/components/locale-flag";
import { cn } from "@/lib/cn";
import { LOCALES, LOCALE_META, detectBrowserLocale, type Locale } from "@/lib/i18n";
import { useI18n } from "@/components/locale-provider";

function matchesQuery(code: Locale, query: string) {
  const meta = LOCALE_META[code];
  const hay = `${meta.nativeName} ${meta.englishName} ${meta.search} ${code}`.toLowerCase();
  return hay.includes(query);
}

export function LanguageClient() {
  const deviceLocale = detectBrowserLocale();
  const { locale, usesDeviceLocale, setLocale, useDeviceLocale, t } = useI18n();
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!needle) return LOCALES;
    return LOCALES.filter((code) => matchesQuery(code, needle));
  }, [needle]);

  return (
    <div className="page-no-topbar max-w-md mx-auto px-4 md:px-8 pb-8">
      <Link
        href="/settings"
        className="inline-flex items-center gap-1 text-[13px] text-muted mb-4"
      >
        <CaretLeft className="w-3.5 h-3.5" />
        {t("language.back")}
      </Link>

      <h1 className="text-[22px] font-semibold tracking-tight">{t("language.title")}</h1>
      <p className="text-muted text-[14px] mt-1.5">{t("language.hint")}</p>

      <label className="relative mt-5 block">
        <span className="sr-only">{t("language.search")}</span>
        <MagnifyingGlass className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("language.search")}
          autoComplete="off"
          enterKeyHint="search"
          className="w-full rounded-[var(--radius-pill)] bg-surface border border-border ps-10 pe-4 py-2.5 text-[14px] outline-none focus:border-accent"
        />
      </label>

      <Card className="mt-4 overflow-hidden p-0">
        {!needle && (
          <button
            type="button"
            onClick={useDeviceLocale}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left border-b border-border"
          >
            <span className="w-9 h-9 rounded-[var(--radius-sm)] bg-accent-soft flex items-center justify-center shrink-0">
              <DeviceMobile className="w-[17px] h-[17px] text-accent" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium">{t("language.device")}</span>
              <span className="block text-[12.5px] text-muted mt-0.5 truncate">
                {t("language.deviceHint", { language: LOCALE_META[deviceLocale].nativeName })}
              </span>
            </span>
            {usesDeviceLocale ? <Check className="w-4 h-4 text-accent shrink-0" /> : null}
          </button>
        )}

        {filtered.length === 0 ? (
          <p className="px-4 py-6 text-[13.5px] text-muted">{t("language.empty")}</p>
        ) : (
          filtered.map((code) => {
            const selected = !usesDeviceLocale && locale === code;
            const meta = LOCALE_META[code];
            return (
              <button
                key={code}
                type="button"
                onClick={() => setLocale(code)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3.5 text-left border-b border-border last:border-b-0",
                  selected && "bg-accent-soft/60"
                )}
              >
                <LocaleFlag locale={code} label={meta.englishName} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium">{meta.nativeName}</span>
                  {meta.englishName !== meta.nativeName ? (
                    <span className="block text-[12.5px] text-muted mt-0.5">{meta.englishName}</span>
                  ) : null}
                </span>
                {selected ? <Check className="w-4 h-4 text-accent shrink-0" /> : null}
              </button>
            );
          })
        )}
      </Card>
    </div>
  );
}

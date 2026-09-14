"use client";

import Link from "next/link";
import { CaretRight } from "@/icons";
import { Card } from "@/components/card";
import { LocaleFlag } from "@/components/locale-flag";
import { LOCALE_META } from "@/lib/i18n";
import { useI18n } from "@/components/locale-provider";

export function LanguageRow() {
  const { locale, usesDeviceLocale, t } = useI18n();
  const name = LOCALE_META[locale].nativeName;
  const current = usesDeviceLocale ? t("language.followingDevice", { language: name }) : name;

  return (
    <Link href="/language">
      <Card className="p-4 flex items-center gap-3.5 active:scale-[0.99] transition-transform">
        <LocaleFlag locale={locale} className="w-9 h-9" label={name} />
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium">{t("language.title")}</p>
          <p className="text-[12.5px] text-muted mt-0.5 truncate">{current}</p>
        </div>
        <CaretRight className="w-4 h-4 text-muted-soft shrink-0" />
      </Card>
    </Link>
  );
}

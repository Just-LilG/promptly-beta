"use client";

import Link from "next/link";
import { CaretRight } from "@/icons";
import { toolItems, type NavItem } from "@/lib/nav";
import { NAV_BLURB_KEY, NAV_LABEL_KEY } from "@/lib/i18n";
import { useI18n } from "@/components/locale-provider";

function ToolRow({ href, icon: Icon }: NavItem) {
  const { t } = useI18n();
  const labelKey = NAV_LABEL_KEY[href];
  const blurbKey = NAV_BLURB_KEY[href];
  return (
    <Link
      href={href}
      className="flex items-center gap-3.5 px-4 py-3.5 border-b border-border last:border-b-0 active:bg-accent-soft/40"
    >
      <span className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center shrink-0">
        <Icon className="w-[18px] h-[18px] text-accent" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-medium">
          {labelKey ? t(`nav.${labelKey}`) : href}
        </span>
        {blurbKey ? (
          <span className="block text-[12.5px] text-muted mt-0.5 leading-snug">
            {t(`navBlurb.${blurbKey}`)}
          </span>
        ) : null}
      </span>
      <CaretRight className="w-4 h-4 text-muted-soft shrink-0" />
    </Link>
  );
}

export function ToolsClient() {
  const { t } = useI18n();
  return (
    <div className="max-w-md mx-auto px-4 md:px-8 pt-3 md:pt-10 pb-8">
      <h1 className="text-[22px] font-semibold tracking-tight">{t("tools.title")}</h1>
      <p className="text-muted text-[14px] mt-1.5">{t("tools.subtitle")}</p>
      <div className="mt-5 rounded-[var(--radius-lg)] border border-border bg-surface overflow-hidden card-shadow">
        {toolItems.map((item) => (
          <ToolRow key={item.href} {...item} />
        ))}
      </div>
    </div>
  );
}

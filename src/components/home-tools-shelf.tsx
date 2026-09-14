"use client";

import Link from "next/link";
import { homeToolPreviewItems, type NavItem } from "@/lib/nav";
import { NAV_LABEL_KEY } from "@/lib/i18n";
import { useI18n } from "@/components/locale-provider";

function ToolTile({ href, icon: Icon }: NavItem) {
  const { t } = useI18n();
  const labelKey = NAV_LABEL_KEY[href];
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-[var(--radius-md)] bg-background/70 border border-border/70 px-3 py-2.5 active:scale-[0.98] transition-transform"
    >
      <span className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-accent" />
      </span>
      <span className="text-[13.5px] font-medium truncate">
        {labelKey ? t(`nav.${labelKey}`) : href}
      </span>
    </Link>
  );
}

export function HomeToolsShelf() {
  const { t } = useI18n();
  return (
    <section className="mt-5">
      <div className="flex items-end justify-between gap-3 mb-2.5 px-0.5">
        <h2 className="text-[15px] font-semibold tracking-tight">{t("home.toolsTitle")}</h2>
        <Link href="/tools" className="text-[13px] font-medium text-accent shrink-0">
          {t("home.seeTools")}
        </Link>
      </div>
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-2.5 card-shadow">
        <div className="grid grid-cols-2 gap-2">
          {homeToolPreviewItems.map((item) => (
            <ToolTile key={item.href} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

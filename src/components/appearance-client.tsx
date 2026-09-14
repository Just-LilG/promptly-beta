"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CaretLeft, Check, DeviceMobile, Moon, Sun } from "@/icons";
import { Card } from "@/components/card";
import { cn } from "@/lib/cn";
import { useI18n } from "@/components/locale-provider";
import { osPrefersDark, type ThemeChoice } from "@/lib/theme";
import { useTheme } from "@/components/theme-provider";

export function AppearanceClient() {
  const { t } = useI18n();
  const { choice, setChoice } = useTheme();
  const [phoneLook, setPhoneLook] = useState("");

  useEffect(() => {
    setPhoneLook(osPrefersDark() ? t("appearance.dark") : t("appearance.light"));
  }, [t]);

  const options: { id: ThemeChoice; title: string; hint: string; icon: typeof Sun }[] = [
    {
      id: "system",
      title: t("appearance.system"),
      hint: t("appearance.systemHint", {
        look: phoneLook || t("appearance.light"),
      }),
      icon: DeviceMobile,
    },
    {
      id: "light",
      title: t("appearance.light"),
      hint: t("appearance.lightHint"),
      icon: Sun,
    },
    {
      id: "dark",
      title: t("appearance.dark"),
      hint: t("appearance.darkHint"),
      icon: Moon,
    },
  ];

  return (
    <div className="page-no-topbar max-w-md mx-auto px-4 md:px-8 pb-8">
      <Link href="/settings" className="inline-flex items-center gap-1 text-[13px] text-muted mb-4">
        <CaretLeft className="w-3.5 h-3.5" />
        {t("appearance.back")}
      </Link>

      <h1 className="text-[22px] font-semibold tracking-tight">{t("appearance.title")}</h1>
      <p className="text-muted text-[14px] mt-1.5">{t("appearance.hint")}</p>

      <Card className="mt-5 overflow-hidden p-0">
        {options.map((option) => {
          const Icon = option.icon;
          const selected = choice === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setChoice(option.id)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3.5 text-left border-b border-border last:border-b-0",
                selected && "bg-accent-soft/60"
              )}
            >
              <span className="w-9 h-9 rounded-[var(--radius-sm)] bg-accent-soft flex items-center justify-center shrink-0">
                <Icon className="w-[17px] h-[17px] text-accent" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium">{option.title}</span>
                <span className="block text-[12.5px] text-muted mt-0.5">{option.hint}</span>
              </span>
              {selected ? <Check className="w-4 h-4 text-accent shrink-0" /> : null}
            </button>
          );
        })}
      </Card>
    </div>
  );
}

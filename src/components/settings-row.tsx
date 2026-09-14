"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CaretRight } from "@/icons";

export function SettingsRow({
  href,
  leading,
  title,
  hint,
  trailing,
}: {
  href: string;
  leading: ReactNode;
  title: string;
  hint?: string;
  trailing?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3.5 px-4 py-3.5 border-b border-border last:border-b-0 active:bg-accent-soft/40"
    >
      <span className="w-9 h-9 rounded-[var(--radius-sm)] bg-accent-soft flex items-center justify-center shrink-0 overflow-hidden">
        {leading}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium">{title}</span>
        {hint ? <span className="block text-[12.5px] text-muted mt-0.5 truncate">{hint}</span> : null}
      </span>
      {trailing}
      <CaretRight className="w-4 h-4 text-muted-soft shrink-0" />
    </Link>
  );
}

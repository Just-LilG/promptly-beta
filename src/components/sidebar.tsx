"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGroup, motion } from "framer-motion";
import { BrandMark } from "@/components/brand-mark";
import { sidebarNavItems } from "@/lib/nav";
import { NAV_LABEL_KEY } from "@/lib/i18n";
import { useI18n } from "@/components/locale-provider";
import { cn } from "@/lib/cn";
import { ProfileAvatar } from "@/components/profile-avatar";
import { ProgressMeter } from "@/components/progress-meter";

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col border-r border-border h-dvh sticky top-0 px-3 py-5 bg-background/80 backdrop-blur-[10px]">
      <div className="flex items-center justify-between px-3 py-2 mb-6">
        <Link href="/" className="flex items-center gap-2.5 min-w-0 group">
          <BrandMark size={44} className="w-11 h-11 rounded-[var(--radius-sm)] transition-transform duration-300 group-hover:scale-[1.04]" />
          <span className="text-[15px] font-semibold tracking-tight">Promptly</span>
        </Link>
        <ProfileAvatar size="sm" />
      </div>

      <LayoutGroup id="sidebar-nav">
        <nav className="flex flex-col gap-0.5">
          {sidebarNavItems.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-[14px] font-medium",
                  active ? "text-accent" : "text-muted hover:text-foreground"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-[var(--radius-sm)] bg-accent-soft"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon className="relative z-[1] w-[18px] h-[18px] shrink-0" />
                <span className="relative z-[1]">
                  {NAV_LABEL_KEY[item.href] ? t(`nav.${NAV_LABEL_KEY[item.href]}`) : item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </LayoutGroup>

      <ProgressMeter />
    </aside>
  );
}

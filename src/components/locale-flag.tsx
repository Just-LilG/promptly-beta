import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";

const FLAG: Record<Locale, ReactNode> = {
  en: (
    <svg viewBox="0 0 32 24" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <rect width="32" height="24" fill="#b22234" />
      <path fill="#fff" d="M0 2h32v2H0zm0 4h32v2H0zm0 4h32v2H0zm0 4h32v2H0zm0 4h32v2H0zm0 4h32v2H0z" />
      <rect width="14" height="12" fill="#3c3b6e" />
    </svg>
  ),
  zh: (
    <svg viewBox="0 0 32 24" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <rect width="32" height="24" fill="#de2910" />
      <path fill="#ffde00" d="M6.2 4.2 7.6 8.4 3.4 6h5.6L5 8.4z" />
      <path fill="#ffde00" d="M11 3.4 11.3 4.8 10 4.1h1.7L10.6 4.8zm2.2 2.4.2 1.3-1.1-.7h1.5l-1.1.7zm.2 3 .6 1.1-1.3-.2 1.2.7-1.2.6zm-1.6 2.4.9.9-1.3.3 1.3.4-.8 1zm-2.6 1.2 1.2.6-1.1.8 1.4-.1-.4 1.3z" />
    </svg>
  ),
  es: (
    <svg viewBox="0 0 32 24" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <rect width="32" height="24" fill="#c60b1e" />
      <rect y="6" width="32" height="12" fill="#ffc400" />
    </svg>
  ),
  ar: (
    <svg viewBox="0 0 32 24" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <rect width="32" height="24" fill="#006c35" />
      <path fill="#fff" d="M8 8.5h16v1.6H8zm0 2.9h16v1.6H8zm3.2 3.2h9.6v1.4H11.2z" />
      <path fill="#fff" d="M22.5 7.2 24 12l-1.5 4.8.9-5z" />
    </svg>
  ),
  hi: (
    <svg viewBox="0 0 32 24" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <rect width="32" height="8" fill="#ff9933" />
      <rect y="8" width="32" height="8" fill="#fff" />
      <rect y="16" width="32" height="8" fill="#138808" />
      <circle cx="16" cy="12" r="2.6" fill="none" stroke="#000088" strokeWidth="1.1" />
    </svg>
  ),
  pt: (
    <svg viewBox="0 0 32 24" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <rect width="32" height="24" fill="#009b3a" />
      <path fill="#fedf00" d="M16 3.2 28.5 12 16 20.8 3.5 12z" />
      <circle cx="16" cy="12" r="4.4" fill="#002776" />
    </svg>
  ),
  id: (
    <svg viewBox="0 0 32 24" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <rect width="32" height="12" fill="#ce1126" />
      <rect y="12" width="32" height="12" fill="#fff" />
    </svg>
  ),
  ja: (
    <svg viewBox="0 0 32 24" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <rect width="32" height="24" fill="#fff" />
      <circle cx="16" cy="12" r="5.6" fill="#bc002d" />
    </svg>
  ),
  ru: (
    <svg viewBox="0 0 32 24" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <rect width="32" height="8" fill="#fff" />
      <rect y="8" width="32" height="8" fill="#0039a6" />
      <rect y="16" width="32" height="8" fill="#d52b1e" />
    </svg>
  ),
  fr: (
    <svg viewBox="0 0 32 24" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <rect width="11" height="24" fill="#002395" />
      <rect x="11" width="10" height="24" fill="#fff" />
      <rect x="21" width="11" height="24" fill="#ed2939" />
    </svg>
  ),
  de: (
    <svg viewBox="0 0 32 24" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <rect width="32" height="8" fill="#000" />
      <rect y="8" width="32" height="8" fill="#dd0000" />
      <rect y="16" width="32" height="8" fill="#ffce00" />
    </svg>
  ),
  ko: (
    <svg viewBox="0 0 32 24" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <rect width="32" height="24" fill="#fff" />
      <circle cx="16" cy="12" r="5" fill="#cd2e3a" />
      <path fill="#0047a0" d="M16 12a5 5 0 0 0 5 5 5 5 0 0 1-5-5 5 5 0 0 1-5-5 5 5 0 0 0 5 5z" />
    </svg>
  ),
};

export function LocaleFlag({
  locale,
  className,
  label,
}: {
  locale: Locale;
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-8 h-8 rounded-full overflow-hidden shrink-0 ring-1 ring-border/70 bg-background",
        className
      )}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {FLAG[locale]}
    </span>
  );
}

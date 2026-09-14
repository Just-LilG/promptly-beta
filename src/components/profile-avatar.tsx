"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { UserAvatar } from "@/components/user-avatar";

export function ProfileAvatar({ size = "sm" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "w-11 h-11" : "w-12 h-12";

  return (
    <Link
      href="/account"
      aria-label="Account"
      className={cn(
        "rounded-full bg-accent-soft border border-border/80 overflow-hidden shrink-0 active:scale-95 transition-transform",
        box
      )}
    >
      <UserAvatar className="w-full h-full" />
    </Link>
  );
}

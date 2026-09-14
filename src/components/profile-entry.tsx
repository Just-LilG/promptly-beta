"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { CaretRight } from "@/icons";
import { emailHandle, firstWord, getGuestHandle } from "@/lib/display-name";
import { UserAvatar } from "@/components/user-avatar";
import { useI18n } from "@/components/locale-provider";

export function ProfileEntry() {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const [guestHandle, setGuestHandle] = useState<string | null>(null);

  useEffect(() => {
    setGuestHandle(getGuestHandle());
  }, []);

  const signedIn = status === "authenticated" && Boolean(session?.user);
  const displayName = signedIn
    ? firstWord(session?.user?.name) ?? emailHandle(session?.user?.email) ?? guestHandle ?? "there"
    : guestHandle;

  return (
    <Link href="/account" className="flex items-center gap-3 py-1 active:opacity-70">
      <div className="w-11 h-11 rounded-full bg-accent-soft border border-border/80 overflow-hidden shrink-0">
        <UserAvatar className="w-full h-full" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14.5px] font-medium truncate">
          {status === "loading" || !displayName ? "…" : displayName}
        </p>
        <p className="text-[12.5px] text-muted">
          {signedIn ? t("more.viewAccount") : t("more.guestHint")}
        </p>
      </div>
      <CaretRight className="w-4 h-4 text-muted-soft shrink-0" />
    </Link>
  );
}

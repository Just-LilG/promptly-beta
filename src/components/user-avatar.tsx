"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import {
  AVATAR_CHANGE_EVENT,
  readAvatarChoice,
  resolveAvatarSrc,
} from "@/lib/avatar";
import { emailHandle, getGuestHandle } from "@/lib/display-name";

export function UserAvatar({
  className,
  alt = "",
}: {
  className?: string;
  alt?: string;
}) {
  const { data: session } = useSession();
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => {
      const seed =
        session?.user?.id ||
        emailHandle(session?.user?.email) ||
        getGuestHandle();
      setSrc(resolveAvatarSrc(readAvatarChoice(), seed, session?.user?.image));
    };
    refresh();
    window.addEventListener(AVATAR_CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(AVATAR_CHANGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [session?.user?.id, session?.user?.email, session?.user?.image]);

  if (!src) {
    return <div className={cn("bg-accent-soft animate-pulse", className)} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={96}
      height={96}
      className={cn("object-cover", className)}
    />
  );
}

"use client";

// Floating entry point into "Send" (user-to-user chat), positioned beside the
// bottom tab bar rather than inside it — the tab bar is a centered 4-item pill
// (see nav.ts: "Keep this to 4 for iOS-style tab bars") and adding a 5th slot
// would both break that rule and break the pill's centering math in
// bottom-tabs.tsx. A separate anchored circle keeps Send visually distinct
// from "talk to AI" (Sandbox) while still reading as part of the same chrome.
//
// Mirrors BottomTabs' own hide-on-scroll / keyboard-open / safe-area handling
// so it never floats over the keyboard or lingers when the tab bar hides.

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChatCircleText } from "@/icons";
import { cn } from "@/lib/cn";
import { subscribeToScrollHide } from "@/lib/scroll-hide-bus";

export function SendFab() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => subscribeToScrollHide(setHidden), []);

  useEffect(() => {
    const read = () =>
      setKeyboardOpen(document.documentElement.dataset.keyboard === "open");
    read();
    window.addEventListener("promptly:keyboard", read);
    return () => window.removeEventListener("promptly:keyboard", read);
  }, []);

  // Hide the launcher on the Send screen itself so it doesn't float over its
  // own chat interface.
  if (pathname.startsWith("/send")) return null;

  return (
    <Link
      href="/send"
      aria-label="Send — chat with other users"
      className={cn(
        "md:hidden fixed z-50 flex items-center justify-center",
        "w-14 h-14 rounded-full card-shadow transition-transform duration-200",
        "ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.92]",
        "phone-chrome-slide"
      )}
      style={{
        background: "var(--accent)",
        // Sits just above the tab bar's own safe-area padding, offset to the
        // right of the centered pill rather than stacked on top of it.
        right: "max(1rem, env(safe-area-inset-right, 0px))",
        bottom:
          "calc(env(safe-area-inset-bottom, 0px) + var(--bottom-chrome, 5.5rem) + 0.75rem)",
        transform: hidden || keyboardOpen ? "translateY(150%)" : "translateY(0)",
      }}
    >
      <ChatCircleText className="w-6 h-6 text-accent-foreground" weight="bold" />
    </Link>
  );
}

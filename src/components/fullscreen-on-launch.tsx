"use client";

import { useEffect } from "react";

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function FullscreenOnLaunch() {
  useEffect(() => {
    // Only take over fullscreen when actually installed/launched as an app —
    // never force this on someone just visiting the site in a normal browser tab.
    if (!isStandaloneDisplay()) return;
    if (document.fullscreenElement) return;

    const requestFullscreen = () => {
      const el = document.documentElement as HTMLElement & {
        requestFullscreen?: () => Promise<void>;
        webkitRequestFullscreen?: () => Promise<void>;
      };
      const request = el.requestFullscreen ?? el.webkitRequestFullscreen;
      if (request) {
        request.call(el).catch(() => {
          // Some engines refuse without a "real" gesture context — fail silently,
          // the manifest's own display mode still applies its own chrome-hiding.
        });
      }
    };

    // The Fullscreen API requires a user gesture, so we wait for the first tap
    // rather than calling this immediately on mount.
    const handler = () => {
      requestFullscreen();
      window.removeEventListener("pointerdown", handler);
    };
    window.addEventListener("pointerdown", handler, { once: true });

    return () => window.removeEventListener("pointerdown", handler);
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";

const KEYBOARD_OPEN_PX = 80;

/**
 * Keeps the typing bar on the visible screen when the phone keyboard
 * opens. Phones often leave the layout the old full height, so the bar
 * sits under the keys. We measure the visible slice and store it as
 * CSS variables the Sandbox can use.
 */
export function VisualViewportSync() {
  useEffect(() => {
    const root = document.documentElement;

    const sync = () => {
      const vv = window.visualViewport;
      const height = Math.round(vv?.height ?? window.innerHeight);
      const inset = vv
        ? Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop))
        : 0;
      root.style.setProperty("--app-height", `${height}px`);
      root.style.setProperty("--keyboard-inset", `${inset}px`);
      const open = inset > KEYBOARD_OPEN_PX && !window.matchMedia("(min-width: 768px)").matches;
      root.dataset.keyboard = open ? "open" : "closed";
      window.dispatchEvent(new Event("promptly:keyboard"));
    };

    sync();
    window.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("scroll", sync);
    return () => {
      window.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("scroll", sync);
      root.style.removeProperty("--app-height");
      root.style.removeProperty("--keyboard-inset");
      delete root.dataset.keyboard;
    };
  }, []);

  return null;
}

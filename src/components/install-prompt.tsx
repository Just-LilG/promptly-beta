"use client";

import { useEffect, useState } from "react";
import { DownloadSimple, ShareNetwork, X, PlusSquare } from "@/icons";
import { Card } from "@/components/card";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISSED_KEY = "promptly:install-prompt-dismissed";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari's own flag for "already added to home screen"
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  // Computed directly during the initial render rather than flipped inside
  // an effect — both conditions here (already installed, previously
  // dismissed) are readable synchronously on the client, so there's no need
  // to start hidden and then reveal a moment later.
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return true;
    if (isStandalone()) return true;
    return window.localStorage.getItem(DISMISSED_KEY) === "1";
  });

  useEffect(() => {
    if (isStandalone()) return; // already installed, never show
    if (window.localStorage.getItem(DISMISSED_KEY) === "1") return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    window.localStorage.setItem(DISMISSED_KEY, "1");
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted" || outcome === "dismissed") {
        setDeferredPrompt(null);
        handleDismiss();
      }
      return;
    }
    if (isIOS()) {
      setShowIOSInstructions(true);
      return;
    }
  };

  // Nothing to offer: not dismissed by user, but no install path available yet
  // (Chrome hasn't fired the event, or this isn't iOS/Chrome at all).
  const canOfferInstall = Boolean(deferredPrompt) || isIOS();
  if (dismissed || !canOfferInstall) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 inset-x-3 md:inset-x-auto md:right-6 md:w-80 z-40">
      <Card className="p-4 flex items-start gap-3 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 p-1 text-muted-soft"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {!showIOSInstructions ? (
          <>
            <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-accent-soft flex items-center justify-center shrink-0">
              <DownloadSimple className="w-[18px] h-[18px] text-accent" />
            </div>
            <div className="min-w-0 pr-4">
              <p className="text-[13.5px] font-medium">Install Promptly</p>
              <p className="text-[12.5px] text-muted mt-0.5 leading-snug">
                Add it to your home screen for a full-screen, app-like experience.
              </p>
              <button
                onClick={handleInstallClick}
                className="mt-2.5 px-3 py-1.5 rounded-[var(--radius-pill)] bg-accent text-accent-foreground text-[12.5px] font-medium active:scale-95 transition-transform"
              >
                Install
              </button>
            </div>
          </>
        ) : (
          <div className="min-w-0 pr-4">
            <p className="text-[13.5px] font-medium mb-2">Add to Home Screen</p>
            <div className="flex items-center gap-2 text-[12.5px] text-muted mb-1.5">
              <ShareNetwork className="w-3.5 h-3.5 shrink-0" />
              <span>1. Tap the ShareNetwork button</span>
            </div>
            <div className="flex items-center gap-2 text-[12.5px] text-muted">
              <PlusSquare className="w-3.5 h-3.5 shrink-0" />
              <span>2. Tap &ldquo;Add to Home Screen&rdquo;</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

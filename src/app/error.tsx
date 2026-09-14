"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Warning, ArrowCounterClockwise, House } from "@/icons";
import { Card } from "@/components/card";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Errors are logged to the console so they're at least visible in dev tools
    // during testing — no external error-reporting service is wired up yet.
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-sm mx-auto px-4 pt-16 pb-8 min-h-dvh flex flex-col items-center text-center">
      <div
        className="w-16 h-16 rounded-[var(--radius-lg)] flex items-center justify-center mb-5"
        style={{ background: "color-mix(in srgb, var(--danger) 15%, transparent)" }}
      >
        <Warning className="w-8 h-8 text-danger" weight="fill" />
      </div>
      <h1 className="text-[22px] font-semibold tracking-tight">Something went wrong</h1>
      <p className="text-muted text-[14px] mt-2 leading-relaxed">
        This page hit an unexpected error. Trying again usually fixes it.
      </p>

      <div className="w-full flex flex-col gap-2.5 mt-7">
        <button onClick={reset} className="block w-full">
          <Card className="p-4 flex items-center justify-center gap-2 bg-accent border-accent active:scale-[0.98] transition-transform">
            <ArrowCounterClockwise className="w-4 h-4 text-accent-foreground" />
            <span className="text-[14px] font-medium text-accent-foreground">Try again</span>
          </Card>
        </button>
        <Link href="/" className="block w-full">
          <Card className="p-4 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
            <House className="w-4 h-4 text-muted" />
            <span className="text-[14px] font-medium">Back to Home</span>
          </Card>
        </Link>
      </div>
    </div>
  );
}

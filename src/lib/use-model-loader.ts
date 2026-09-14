"use client";

import { useCallback, useRef, useState } from "react";
import type { InitProgressReport } from "@mlc-ai/web-llm";
import { getEngine, isWebGPUSupported } from "@/lib/webllm-engine";

export type LoadState =
  | { status: "unsupported" }
  | { status: "idle" }
  | { status: "loading"; progress: number; text: string }
  | { status: "ready" }
  | { status: "error"; message: string };

export function useModelLoader() {
  const [loadState, setLoadState] = useState<LoadState>(() =>
    isWebGPUSupported() ? { status: "idle" } : { status: "unsupported" }
  );
  const engineRef = useRef<Awaited<ReturnType<typeof getEngine>> | null>(null);

  const load = useCallback(async () => {
    setLoadState((current) => {
      if (current.status === "unsupported") return current;
      return { status: "loading", progress: 0, text: "Starting..." };
    });
    try {
      const engine = await getEngine((report: InitProgressReport) => {
        setLoadState({
          status: "loading",
          progress: report.progress ?? 0,
          text: report.text ?? "Loading model...",
        });
      });
      engineRef.current = engine;
      setLoadState({ status: "ready" });
    } catch (err) {
      setLoadState({
        status: "error",
        message: err instanceof Error ? err.message : "Failed to load the model.",
      });
    }
  }, []);

  return { loadState, engineRef, load };
}

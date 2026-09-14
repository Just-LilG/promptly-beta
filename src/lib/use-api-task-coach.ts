"use client";

import { useCallback, useRef, useState } from "react";
import { TASK_COACH_SYSTEM_PROMPT } from "@/lib/tutor-persona";
import { parseTaskCoachResponse, type TaskCoachResult } from "@/lib/task-coach-parser";

export function useApiTaskCoach() {
  const [rawResponse, setRawResponse] = useState("");
  const [result, setResult] = useState<TaskCoachResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const evaluate = useCallback(async (taskText: string) => {
    setIsGenerating(true);
    setRawResponse("");
    setResult(null);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: TASK_COACH_SYSTEM_PROMPT,
          messages: [{ role: "user", content: taskText }],
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const errBody = await res.json().catch(() => ({ error: "Request failed." }));
        throw new Error(errBody.error ?? "Request failed.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setRawResponse(full);
      }
      setResult(parseTaskCoachResponse(full));
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // User-initiated stop — try to parse whatever streamed so far rather
        // than discarding it, since a partial verdict may still be useful.
        setResult((current) => current ?? parseTaskCoachResponse(rawResponse));
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    setRawResponse("");
    setResult(null);
    setError(null);
  }, []);

  return { evaluate, rawResponse, result, isGenerating, error, reset, stop };
}

"use client";

import { useCallback, useState } from "react";
import { useModelLoader } from "@/lib/use-model-loader";
import { TASK_COACH_SYSTEM_PROMPT } from "@/lib/tutor-persona";
import { parseTaskCoachResponse, type TaskCoachResult } from "@/lib/task-coach-parser";

export function useTaskCoach() {
  const { loadState, engineRef, load } = useModelLoader();
  const [rawResponse, setRawResponse] = useState("");
  const [result, setResult] = useState<TaskCoachResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const evaluate = useCallback(
    async (taskText: string) => {
      if (!engineRef.current || loadState.status !== "ready") return;
      const engine = engineRef.current;

      setIsGenerating(true);
      setRawResponse("");
      setResult(null);

      try {
        const chunks = await engine.chat.completions.create({
          messages: [
            { role: "system", content: TASK_COACH_SYSTEM_PROMPT },
            { role: "user", content: taskText },
          ],
          stream: true,
          temperature: 0.4, // lower temperature — this is an evaluation, not creative writing
        });

        let full = "";
        for await (const chunk of chunks) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          full += delta;
          setRawResponse(full);
        }
        setResult(parseTaskCoachResponse(full));
      } catch (err) {
        setRawResponse(
          "Something went wrong evaluating this. " + (err instanceof Error ? err.message : "")
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [engineRef, loadState.status]
  );

  const reset = useCallback(() => {
    setRawResponse("");
    setResult(null);
  }, []);

  const stop = useCallback(() => {
    engineRef.current?.interruptGenerate();
  }, [engineRef]);

  return { loadState, load, evaluate, rawResponse, result, isGenerating, reset, stop };
}

"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Target,
  Sparkle,
  Check,
  ArrowRight,
  ArrowCounterClockwise,
  Cpu,
  CloudCheck,
  DeviceMobile,
  Stop,
  ClockCounterClockwise,
} from "@/icons";
import { Card } from "@/components/card";
import { cn } from "@/lib/cn";
import { useTaskCoach } from "@/lib/use-task-coach";
import { useApiTaskCoach } from "@/lib/use-api-task-coach";
import { improvePrompt } from "@/lib/compare";
import { getAIEnginePreference, setAIEnginePreference, type AIEngine } from "@/lib/ai-engine-preference";
import { MarkdownContent } from "@/components/markdown-content";
import { MessageActions } from "@/components/message-actions";
import { ThinkingIndicator } from "@/components/thinking-indicator";
import { TaskHistoryPanel } from "@/components/task-history-panel";
import {
  listTaskEvaluations,
  saveTaskEvaluation,
  deleteTaskEvaluation,
  getTaskEvaluation,
  type TaskEvaluation,
} from "@/lib/task-history";
import type { TaskCoachResult } from "@/lib/task-coach-parser";

const TASK_DRAFT_KEY = "promptly:task-coach-draft";

export function TaskCoachClient() {
  const [engine, setEngine] = useState<AIEngine>(() =>
    typeof window === "undefined" ? "local" : getAIEnginePreference()
  );
  // engineLoaded exists only to defer first paint until the client read
  // above has happened — lazy-init makes that read happen during the
  // initial render itself, so it's already true by the time this runs.
  const [engineLoaded] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [evaluations, setEvaluations] = useState<TaskEvaluation[]>(() =>
    typeof window === "undefined" ? [] : listTaskEvaluations()
  );
  const [viewedEvaluation, setViewedEvaluation] = useState<TaskEvaluation | null>(null);

  const handleEngineChange = (next: AIEngine) => {
    setEngine(next);
    setAIEnginePreference(next);
  };

  const local = useTaskCoach();
  const api = useApiTaskCoach();

  const [input, setInput] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return window.localStorage.getItem(TASK_DRAFT_KEY) ?? "";
    } catch {
      return "";
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(TASK_DRAFT_KEY, input);
    } catch {
      // non-critical
    }
  }, [input]);

  const [fallbackResult, setFallbackResult] = useState<ReturnType<typeof improvePrompt> | null>(
    null
  );

  const isUnsupported = engine === "local" && local.loadState.status === "unsupported";
  const liveResult = engine === "local" ? local.result : api.result;
  const result: TaskCoachResult | null = viewedEvaluation ? viewedEvaluation.result : liveResult;
  const rawResponse = engine === "local" ? local.rawResponse : api.rawResponse;
  const isGenerating = engine === "local" ? local.isGenerating : api.isGenerating;
  const stop = engine === "local" ? local.stop : api.stop;

  // Save to history once a fresh (not history-reopened) result completes.
  // Refreshing the visible `evaluations` list happens separately, when the
  // history panel is actually opened (see the button above) — not here,
  // since this effect's job is the save side effect itself, not driving
  // what's rendered in a panel that may not even be open right now.
  useEffect(() => {
    if (liveResult && !isGenerating && !viewedEvaluation && input.trim()) {
      saveTaskEvaluation(input.trim(), liveResult);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveResult, isGenerating]);

  const handleEvaluate = () => {
    if (!input.trim()) return;
    setViewedEvaluation(null);
    if (isUnsupported) {
      setFallbackResult(improvePrompt(input));
      return;
    }
    if (engine === "local") {
      local.evaluate(input);
    } else {
      api.evaluate(input);
    }
    try {
      window.localStorage.removeItem(TASK_DRAFT_KEY);
    } catch {
      // non-critical
    }
  };

  const handleReset = () => {
    setInput("");
    setFallbackResult(null);
    setViewedEvaluation(null);
    local.reset();
    api.reset();
  };

  const handleSelectHistory = (id: string) => {
    const evaluation = getTaskEvaluation(id);
    if (evaluation) {
      setViewedEvaluation(evaluation);
      setInput(evaluation.taskText);
    }
    setShowHistory(false);
  };

  const handleDeleteHistory = (id: string) => {
    deleteTaskEvaluation(id);
    setEvaluations(listTaskEvaluations());
  };

  const hasResult = Boolean(result) || Boolean(fallbackResult) || (isGenerating && rawResponse);
  const canSubmit =
    input.trim() &&
    (isUnsupported || engine === "api" || local.loadState.status === "ready");

  if (!engineLoaded) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 pt-6 md:pt-10 pb-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-accent-soft flex items-center justify-center shrink-0">
            <Target className="w-[18px] h-[18px] text-accent" weight="regular" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[20px] font-semibold tracking-tight">Bring your own task</h1>
            <p className="text-muted text-[13px] mt-0.5">
              Paste a real prompt you&apos;re about to send.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            // Refresh right before showing the panel, rather than reactively
            // from the save-effect below — this is a real user action, so
            // it's the correct place for this setState call, and it means
            // the list is always current at the moment it's actually shown.
            setEvaluations(listTaskEvaluations());
            setShowHistory(true);
          }}
          className="p-2.5 rounded-[var(--radius-pill)] bg-surface border border-border shrink-0"
          aria-label="History"
        >
          <ClockCounterClockwise className="w-4 h-4 text-muted" />
        </button>
      </div>

      <div className="flex items-center gap-1 p-1 rounded-[var(--radius-pill)] bg-surface border border-border w-fit mt-3">
        <button
          onClick={() => handleEngineChange("local")}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius-pill)] text-[12.5px] font-medium transition-colors",
            engine === "local" ? "bg-accent text-accent-foreground" : "text-muted"
          )}
        >
          <DeviceMobile className="w-3.5 h-3.5" />
          Local
        </button>
        <button
          onClick={() => handleEngineChange("api")}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius-pill)] text-[12.5px] font-medium transition-colors",
            engine === "api" ? "bg-accent text-accent-foreground" : "text-muted"
          )}
        >
          <CloudCheck className="w-3.5 h-3.5" />
          API
        </button>
      </div>

      {isUnsupported && (
        <Card className="p-3.5 mt-4 flex items-start gap-2.5">
          <Cpu className="w-4 h-4 text-muted-soft shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-muted leading-relaxed">
            This device can&apos;t run the local AI coach, so you&apos;ll get a lighter structural check
            instead. Or switch to the API engine above for full AI feedback.
          </p>
        </Card>
      )}

      {engine === "local" && !isUnsupported && local.loadState.status === "idle" && (
        <Card className="p-4 mt-4 flex items-center justify-between gap-3">
          <p className="text-[13px] text-muted">Load the AI coach for full feedback on your task.</p>
          <button
            onClick={local.load}
            className="shrink-0 px-3.5 py-2 rounded-[var(--radius-pill)] bg-accent text-accent-foreground text-[13px] font-medium active:scale-95 transition-transform"
          >
            Load
          </button>
        </Card>
      )}

      {engine === "local" && local.loadState.status === "loading" && (
        <Card className="p-4 mt-4 flex flex-col gap-2">
          <div className="h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${Math.round(local.loadState.progress * 100)}%` }}
            />
          </div>
          <p className="text-[12.5px] text-muted">{local.loadState.text}</p>
        </Card>
      )}

      {engine === "api" && api.error && !hasResult && (
        <Card className="p-3.5 mt-4">
          <p className="text-[12.5px] text-danger leading-relaxed">{api.error}</p>
        </Card>
      )}

      {!hasResult && (
        <div className="mt-4 flex flex-col gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste the actual prompt you're planning to send..."
            rows={6}
            className="w-full rounded-[var(--radius-md)] bg-surface border border-border p-3.5 text-[14px] leading-relaxed resize-none outline-none focus:border-accent transition-colors"
          />
          <button
            onClick={handleEvaluate}
            disabled={!canSubmit}
            className="self-end flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-pill)] bg-accent text-accent-foreground text-[13.5px] font-medium disabled:opacity-40 active:scale-95 transition-transform"
          >
            <Sparkle className="w-3.5 h-3.5" weight="fill" />
            Evaluate
          </button>
        </div>
      )}

      {!isUnsupported && (isGenerating || result) && (
        <div className="mt-5 flex flex-col gap-3">
          {!result && isGenerating && (
            <Card className="p-4">
              {rawResponse ? (
                <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap text-muted">
                  {rawResponse}
                </p>
              ) : (
                <ThinkingIndicator />
              )}
            </Card>
          )}

          {result && (
            <>
              <MessageActions content={result.verdict}>
                <Card className="p-4">
                  <p className="text-[12px] font-medium text-accent uppercase tracking-wide mb-1.5">
                    Verdict
                  </p>
                  <MarkdownContent content={result.verdict} />
                </Card>
              </MessageActions>

              {result.strong.length > 0 && (
                <Card className="p-4">
                  <p className="text-[12px] font-medium text-muted uppercase tracking-wide mb-2.5">
                    What&apos;s working
                  </p>
                  <div className="flex flex-col gap-2">
                    {result.strong.map((s, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="w-4.5 h-4.5 rounded-full bg-accent-soft flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-accent" weight="bold" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <MarkdownContent content={s} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {result.needsWork.length > 0 && (
                <Card className="p-4">
                  <p className="text-[12px] font-medium text-muted uppercase tracking-wide mb-2.5">
                    Needs work
                  </p>
                  <div className="flex flex-col gap-2">
                    {result.needsWork.map((s, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <ArrowRight className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <MarkdownContent content={s} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {result.rewrite && (
                <MessageActions content={result.rewrite}>
                  <Card className="p-4">
                    <p className="text-[12px] font-medium text-muted uppercase tracking-wide mb-2">
                      Suggested rewrite
                    </p>
                    <MarkdownContent content={result.rewrite} />
                  </Card>
                </MessageActions>
              )}
            </>
          )}
        </div>
      )}

      {fallbackResult && (
        <div className="mt-5 flex flex-col gap-3">
          <Card className="p-4">
            <p className="text-[12px] font-medium text-muted uppercase tracking-wide mb-2">
              Rewritten with gaps marked
            </p>
            <p className="text-[14px] leading-relaxed whitespace-pre-wrap">
              {fallbackResult.rewritten}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-[13.5px] font-semibold mb-3">What to check</p>
            <div className="flex flex-col gap-3">
              {fallbackResult.notes.map((note, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <ArrowRight className="w-3.5 h-3.5 text-accent shrink-0 mt-1" />
                  <div>
                    <p className="text-[13.5px] font-medium">{note.issue}</p>
                    <p className="text-[12.5px] text-muted mt-0.5 leading-snug">{note.fix}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {isGenerating && (
        <button
          onClick={stop}
          className="mt-4 flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-pill)] bg-foreground text-background text-[13.5px] font-medium active:scale-95 transition-transform"
        >
          <Stop className="w-3.5 h-3.5" weight="fill" />
          Stop generating
        </button>
      )}

      {hasResult && !isGenerating && (
        <button
          onClick={handleReset}
          className="mt-4 flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-pill)] bg-surface border border-border text-[13.5px] font-medium active:scale-95 transition-transform"
        >
          <ArrowCounterClockwise className="w-3.5 h-3.5" />
          Evaluate another
        </button>
      )}

      <AnimatePresence>
        {showHistory && (
          <TaskHistoryPanel
            evaluations={evaluations}
            onSelect={handleSelectHistory}
            onDelete={handleDeleteHistory}
            onClose={() => setShowHistory(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

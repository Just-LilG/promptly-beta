"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkle, Check, X, ArrowCounterClockwise, ArrowRight, PencilSimple } from "@/icons";
import { Card } from "@/components/card";
import { cn } from "@/lib/cn";
import { evaluateScenario, getScenario, type Scenario, type ScenarioResult } from "@/lib/scenarios";
import { markScenarioComplete } from "@/lib/progress";
import { CelebrationBurst } from "@/components/celebration-burst";
import { StreakMilestoneModal } from "@/components/streak-milestone-modal";
import { ThinkingIndicator } from "@/components/thinking-indicator";

type Tier = "strong" | "mid" | "weak";

function tierFor(score: number): Tier {
  if (score >= 70) return "strong";
  if (score >= 40) return "mid";
  return "weak";
}

const TIER_COPY: Record<Tier, { label: string; color: string }> = {
  strong: { label: "Nice work", color: "text-accent" },
  mid: { label: "Getting there", color: "text-foreground" },
  weak: { label: "Needs work", color: "text-danger" },
};

export function ScenarioClient({
  trackSlug,
  scenarioSlug,
  nextHref,
  nextTitle,
  doneHref = "/tracks",
  doneLabel = "Pick another track",
}: {
  trackSlug: string;
  scenarioSlug: string;
  nextHref?: string;
  nextTitle?: string;
  doneHref?: string;
  doneLabel?: string;
}) {
  // Scenario data (including its check functions) is looked up here, inside the
  // client component, rather than passed in as a prop — functions can't cross
  // the server/client boundary as props, only plain serializable data can.
  const scenario = getScenario(trackSlug, scenarioSlug) as Scenario;

  const [prompt, setPrompt] = useState("");
  const [thinking, setThinking] = useState(false);
  const [submitted, setSubmitted] = useState<{ prompt: string; result: ScenarioResult } | null>(
    null
  );
  const [milestone, setMilestone] = useState<number | null>(null);

  const handleSubmit = () => {
    if (!prompt.trim() || thinking) return;
    setThinking(true);
    // A brief artificial delay sells the "the AI is actually responding"
    // moment this whole app is built around — without it, feedback appears
    // instantly and the illusion breaks. Kept short enough not to feel like
    // a fake loading bar.
    const trimmed = prompt;
    window.setTimeout(() => {
      const result = evaluateScenario(scenario, trimmed);
      setSubmitted({ prompt: trimmed, result });
      setThinking(false);
      const activity = markScenarioComplete(scenario.trackSlug, scenario.slug, result.score);
      if (activity.hitMilestone) {
        window.setTimeout(() => setMilestone(activity.state.current), 900);
      }
    }, 900);
  };

  const handleRetry = () => {
    // Preserve the draft on retry — a user iterating on a prompt that scored
    // low shouldn't have to retype from scratch. They can edit what's there.
    setPrompt(submitted?.prompt ?? prompt);
    setSubmitted(null);
  };

  const handleStartFresh = () => {
    setPrompt("");
    setSubmitted(null);
  };

  const tier = submitted ? tierFor(submitted.result.score) : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Goal */}
      <Card className="p-4 md:p-5">
        <p className="text-[12px] font-medium text-accent uppercase tracking-wide">Your goal</p>
        <p className="text-[14.5px] mt-1.5 leading-relaxed">{scenario.goal}</p>
      </Card>

      {/* Context, if any */}
      {scenario.context && (
        <Card className="p-4 md:p-5">
          <p className="text-[12px] font-medium text-muted uppercase tracking-wide">
            {scenario.context.label}
          </p>
          <pre className="mt-2.5 text-[12.5px] leading-relaxed overflow-x-auto rounded-[var(--radius-sm)] bg-background border border-border p-3 whitespace-pre-wrap">
            <code>{scenario.context.content}</code>
          </pre>
        </Card>
      )}

      {/* Prompt input */}
      {!submitted && (
        <div className="flex flex-col gap-2.5">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Write the prompt you'd actually send..."
            rows={4}
            disabled={thinking}
            className="w-full rounded-[var(--radius-md)] bg-surface border border-border p-3.5 text-[14px] leading-relaxed resize-none outline-none focus:border-accent transition-colors disabled:opacity-60"
          />
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || thinking}
            className="self-end px-4 py-2.5 rounded-[var(--radius-pill)] bg-accent text-accent-foreground text-[13.5px] font-medium disabled:opacity-40 active:scale-95 transition-transform"
          >
            Send to AI
          </button>
        </div>
      )}

      {/* Thinking state — brief, sells the "AI is responding" moment */}
      <AnimatePresence>
        {thinking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-4 md:p-5 flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-[var(--radius-sm)] bg-accent-soft flex items-center justify-center shrink-0">
                <Sparkle className="w-3.5 h-3.5 text-accent" />
              </div>
              <ThinkingIndicator />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulated AI response + coach feedback */}
      <AnimatePresence>
        {submitted && tier && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05 }}
            >
              <Card className="p-4 md:p-5 bg-background border-border">
                <p className="text-[12px] font-medium text-muted uppercase tracking-wide">
                  You wrote
                </p>
                <p className="text-[14px] mt-1.5 leading-relaxed whitespace-pre-wrap">
                  {submitted.prompt}
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.15 }}
            >
              <Card className="p-4 md:p-5">
                <div className="flex items-center gap-2">
                  <motion.div
                    initial={{ scale: 0.5, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
                    className="w-6 h-6 rounded-[var(--radius-sm)] bg-accent flex items-center justify-center shrink-0"
                  >
                    <Sparkle className="w-3.5 h-3.5 text-accent-foreground" />
                  </motion.div>
                  <p className="text-[12px] font-medium text-muted uppercase tracking-wide">
                    AI response
                  </p>
                </div>
                <p className="text-[14px] mt-2.5 leading-relaxed whitespace-pre-wrap">
                  {submitted.result.aiResponse}
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.25 }}
            >
              <Card className="p-4 md:p-5 relative overflow-visible">
                <div className="flex items-center justify-between relative">
                  <div className="flex items-center gap-2">
                    <p className="text-[13.5px] font-semibold">Coach feedback</p>
                    {tier === "strong" && (
                      <motion.span
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.55, duration: 0.25 }}
                        className="text-[11.5px] font-semibold text-accent bg-accent-soft px-2 py-0.5 rounded-full"
                      >
                        {TIER_COPY.strong.label}
                      </motion.span>
                    )}
                  </div>

                  <div className="relative">
                    {tier === "strong" && (
                      <div className="absolute inset-0 pointer-events-none">
                        <CelebrationBurst intensity="medium" />
                      </div>
                    )}
                    <motion.span
                      initial={
                        tier === "strong"
                          ? { opacity: 0, scale: 0.4 }
                          : { opacity: 0, scale: 0.85 }
                      }
                      animate={{ opacity: 1, scale: 1 }}
                      transition={
                        tier === "strong"
                          ? { duration: 0.6, ease: [0.34, 1.56, 0.64, 1], delay: 0.4 }
                          : { duration: 0.3, ease: "easeOut", delay: 0.35 }
                      }
                      className={cn("text-[13.5px] font-semibold block", TIER_COPY[tier].color)}
                    >
                      {submitted.result.score}/100
                    </motion.span>
                  </div>
                </div>

                {tier === "weak" && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="text-[13px] text-muted mt-2"
                  >
                    A few things to add. Here&apos;s what the checklist is looking for.
                  </motion.p>
                )}

                <div className="mt-3.5 flex flex-col gap-2.5">
                  {submitted.result.passed.map((rule, i) => (
                    <motion.div
                      key={rule.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: 0.4 + i * 0.06 }}
                      className="flex items-start gap-2.5"
                    >
                      <div className="w-4.5 h-4.5 rounded-full bg-accent-soft flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-accent" />
                      </div>
                      <p className="text-[13.5px] leading-snug">{rule.label}</p>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {submitted.result.failed[0] && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.55 }}
              >
                <Card className="p-4">
                  <p className="text-[11px] font-medium text-muted uppercase tracking-wide">
                    Try this next
                  </p>
                  <div className="flex items-start gap-2.5 mt-2">
                    <div
                      className="w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: "color-mix(in srgb, var(--danger) 15%, transparent)" }}
                    >
                      <X className="w-3 h-3 text-danger" />
                    </div>
                    <div>
                      <p className="text-[14.5px] font-medium leading-snug">
                        {submitted.result.failed[0].label}
                      </p>
                      <p className="text-[13px] text-muted mt-1 leading-snug">
                        {submitted.result.failed[0].hintIfMissing}
                      </p>
                      {submitted.result.failed.length > 1 && (
                        <p className="text-[12px] text-muted mt-1.5">
                          Plus {submitted.result.failed.length - 1} other habit
                          {submitted.result.failed.length - 1 === 1 ? "" : "s"} on retry.
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              className="flex items-center gap-2.5 flex-wrap"
            >
              <button
                onClick={handleRetry}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-pill)] bg-surface border border-border text-[13.5px] font-medium active:scale-95 transition-transform"
              >
                <PencilSimple className="w-3.5 h-3.5" />
                Edit & retry
              </button>
              {submitted.result.score < 100 && (
                <button
                  onClick={handleStartFresh}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-[var(--radius-pill)] text-[13px] font-medium text-muted active:scale-95 transition-transform"
                >
                  <ArrowCounterClockwise className="w-3.5 h-3.5" />
                  Start fresh
                </button>
              )}
              {nextHref ? (
                <Link
                  href={nextHref}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-pill)] bg-accent text-accent-foreground text-[13.5px] font-medium active:scale-95 transition-transform ml-auto max-w-full"
                >
                  <span className="truncate">
                    {nextTitle ? `Next: ${nextTitle}` : "Next scenario"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </Link>
              ) : (
                <Link
                  href={doneHref}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-pill)] bg-accent text-accent-foreground text-[13.5px] font-medium active:scale-95 transition-transform ml-auto"
                >
                  {doneLabel}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <StreakMilestoneModal streak={milestone} onClose={() => setMilestone(null)} />
    </div>
  );
}

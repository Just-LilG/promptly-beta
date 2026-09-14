"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkle, Check } from "@/icons";
import { Card } from "@/components/card";
import { tracks } from "@/lib/tracks";
import { saveOnboardingProfile, skipOnboarding, type SkillLevel } from "@/lib/onboarding";
import { evaluateScenario, getTrackScenarios, type Scenario } from "@/lib/scenarios";
import { StaggerGroup, StaggerItem } from "@/components/stagger-group";

const SKILL_OPTIONS: { value: SkillLevel; label: string; detail: string }[] = [
  { value: "beginner", label: "New to this", detail: "I've used AI a little, but not with much strategy." },
  { value: "some-experience", label: "Some experience", detail: "I use AI regularly but know I could do better." },
  { value: "experienced", label: "Very experienced", detail: "I already think carefully about my prompts." },
];

const stepVariants = {
  enter: { opacity: 0, x: 24 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

export function OnboardingClient() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [skillLevel, setSkillLevel] = useState<SkillLevel | null>(null);
  const [interest, setInterest] = useState<string | null>(null);
  const [diagnosticPrompt, setDiagnosticPrompt] = useState("");
  const [diagnosticScore, setDiagnosticScore] = useState<number | null>(null);

  const totalSteps = 3;

  const handleSkillNext = (level: SkillLevel) => {
    setSkillLevel(level);
    setStep(1);
  };

  const handleInterestNext = (slug: string) => {
    setInterest(slug);
    setDiagnosticPrompt("");
    setDiagnosticScore(null);
    setStep(2);
  };

  const diagnostic: Scenario | undefined = interest
    ? getTrackScenarios(interest)[0]
    : undefined;
  const interestTrack = tracks.find((track) => track.slug === interest);

  const handleDiagnosticSubmit = () => {
    if (!diagnosticPrompt.trim() || !diagnostic) return;
    const result = evaluateScenario(diagnostic, diagnosticPrompt);
    setDiagnosticScore(result.score);
  };

  const handleFinish = () => {
    if (!skillLevel || !interest) return;
    saveOnboardingProfile({
      skillLevel,
      primaryInterest: interest,
      diagnosticScore,
    });
    router.push("/");
  };

  const handleSkip = () => {
    skipOnboarding();
    router.push("/");
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-10 pb-8 min-h-dvh flex flex-col">
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <motion.div
            key={i}
            className="h-1 flex-1 rounded-full bg-border overflow-hidden"
          >
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: i <= step ? "100%" : "0%" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col"
          >
            <h1 className="text-[22px] font-semibold tracking-tight">
              How experienced are you with AI?
            </h1>
            <p className="text-muted text-[13.5px] mt-1.5 mb-6">
              No wrong answer. This just shapes where we start you off.
            </p>
            <StaggerGroup className="flex flex-col gap-2.5">
              {SKILL_OPTIONS.map((opt) => (
                <StaggerItem key={opt.value}>
                  <button onClick={() => handleSkillNext(opt.value)} className="text-left w-full">
                    <Card className="p-4 active:scale-[0.98] transition-transform">
                      <p className="text-[14.5px] font-semibold">{opt.label}</p>
                      <p className="text-[12.5px] text-muted mt-1">{opt.detail}</p>
                    </Card>
                  </button>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step1"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col"
          >
            <h1 className="text-[22px] font-semibold tracking-tight">
              What do you mainly want AI for?
            </h1>
            <p className="text-muted text-[13.5px] mt-1.5 mb-6">
              We&apos;ll suggest this as your starting track. You can explore the rest anytime.
            </p>
            <StaggerGroup className="grid grid-cols-2 gap-2.5">
              {tracks.map((track) => {
                const Icon = track.icon;
                return (
                  <StaggerItem key={track.slug}>
                    <button onClick={() => handleInterestNext(track.slug)} className="text-left w-full">
                      <Card className="p-3.5 h-full active:scale-[0.97] transition-transform">
                        <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-accent-soft flex items-center justify-center">
                          <Icon className="w-[16px] h-[16px] text-accent" weight="regular" />
                        </div>
                        <p className="text-[13px] font-semibold mt-2.5 leading-snug">{track.name}</p>
                      </Card>
                    </button>
                  </StaggerItem>
                );
              })}
            </StaggerGroup>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col"
          >
            <h1 className="text-[22px] font-semibold tracking-tight">One quick try</h1>
            <p className="text-muted text-[13.5px] mt-1.5 mb-5">
              {interestTrack
                ? `Because you picked ${interestTrack.name}, this first question is from that world.`
                : "Write a prompt for this situation."}
            </p>
            {diagnostic && (
              <p className="text-[14.5px] leading-relaxed mb-5">{diagnostic.goal}</p>
            )}

            {diagnostic?.context && (
              <Card className="p-4 mb-4">
                <p className="text-[12px] font-medium text-muted uppercase tracking-wide">
                  {diagnostic.context.label}
                </p>
                <pre className="mt-2 text-[12.5px] leading-relaxed overflow-x-auto rounded-[var(--radius-sm)] bg-background border border-border p-3 whitespace-pre-wrap">
                  <code>{diagnostic.context.content}</code>
                </pre>
              </Card>
            )}

            <AnimatePresence mode="wait">
              {diagnosticScore === null ? (
                <motion.div
                  key="input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-3"
                >
                  <textarea
                    value={diagnosticPrompt}
                    onChange={(e) => setDiagnosticPrompt(e.target.value)}
                    placeholder="Write the prompt you'd actually send..."
                    rows={4}
                    className="w-full rounded-[var(--radius-md)] bg-surface border border-border p-3.5 text-[14px] leading-relaxed resize-none outline-none focus:border-accent transition-colors"
                  />
                  <button
                    onClick={handleDiagnosticSubmit}
                    disabled={!diagnosticPrompt.trim()}
                    className="self-end px-4 py-2.5 rounded-[var(--radius-pill)] bg-accent text-accent-foreground text-[13.5px] font-medium disabled:opacity-40 active:scale-95 transition-transform"
                  >
                    Check it
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col gap-4"
                >
                  <Card className="p-5 text-center">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
                      className="w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-3"
                    >
                      <Sparkle className="w-6 h-6 text-accent" weight="fill" />
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.25 }}
                      className="text-[26px] font-semibold"
                    >
                      {diagnosticScore}
                      <span className="text-[15px] text-muted">/100</span>
                    </motion.p>
                    <p className="text-[13px] text-muted mt-1">
                      {diagnosticScore >= 70
                        ? "Solid instincts already. We'll move at a good pace."
                        : diagnosticScore >= 40
                        ? "A good starting point. There's room to sharpen this."
                        : "A great baseline to build from. This is exactly what practice is for."}
                    </p>
                  </Card>
                  <button
                    onClick={handleFinish}
                    className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-[var(--radius-pill)] bg-accent text-accent-foreground text-[14px] font-medium active:scale-95 transition-transform"
                  >
                    <Check className="w-4 h-4" weight="bold" />
                    Start using Promptly
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {step < 2 && (
        <button onClick={handleSkip} className="mt-6 text-[13px] text-muted-soft text-center">
          Skip for now
        </button>
      )}
    </div>
  );
}

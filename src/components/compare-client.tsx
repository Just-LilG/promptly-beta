"use client";

import { useState } from "react";
import { GitDiff, ArrowRight, ArrowCounterClockwise } from "@/icons";
import { Card } from "@/components/card";
import { improvePrompt, type CompareResult } from "@/lib/compare";

const EXAMPLES = [
  "Write me a bio",
  "Make this email better",
  "Summarize this but keep it brief and cover everything",
];

export function CompareClient() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<CompareResult | null>(null);

  const handleCompare = () => {
    if (!input.trim()) return;
    setResult(improvePrompt(input));
  };

  const handleReset = () => {
    setInput("");
    setResult(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 pt-6 md:pt-10 pb-8">
      <h1 className="text-[22px] font-semibold tracking-tight">Compare</h1>
      <p className="text-muted text-[14px] mt-1.5">
        Paste a prompt you&apos;re about to send. See what&apos;s missing before you send it.
      </p>

      {!result && (
        <div className="mt-5 flex flex-col gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste or write a prompt..."
            rows={4}
            className="w-full rounded-[var(--radius-md)] bg-surface border border-border p-3.5 text-[14px] leading-relaxed resize-none outline-none focus:border-accent transition-colors"
          />

          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setInput(ex)}
                className="px-3 py-1.5 rounded-[var(--radius-pill)] bg-surface border border-border text-[12.5px] text-muted"
              >
                {ex}
              </button>
            ))}
          </div>

          <button
            onClick={handleCompare}
            disabled={!input.trim()}
            className="self-end flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-pill)] bg-accent text-accent-foreground text-[13.5px] font-medium disabled:opacity-40 active:scale-95 transition-transform"
          >
            <GitDiff className="w-3.5 h-3.5" />
            Compare
          </button>
        </div>
      )}

      {result && (
        <div className="mt-5 flex flex-col gap-4">
          <div className="grid md:grid-cols-2 gap-3">
            <Card className="p-4">
              <p className="text-[12px] font-medium text-muted uppercase tracking-wide mb-2">
                Before
              </p>
              <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{input}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <p className="text-[12px] font-medium text-accent uppercase tracking-wide">After</p>
              </div>
              <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{result.rewritten}</p>
            </Card>
          </div>

          <Card className="p-4 md:p-5">
            <p className="text-[13.5px] font-semibold mb-3">What&apos;s missing and why</p>
            <div className="flex flex-col gap-3">
              {result.notes.map((note, i) => (
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

          <button
            onClick={handleReset}
            className="self-start flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-pill)] bg-surface border border-border text-[13.5px] font-medium active:scale-95 transition-transform"
          >
            <ArrowCounterClockwise className="w-3.5 h-3.5" />
            Try another
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CaretDown, ShieldCheck, BookOpen, Cpu } from "@/icons";
import { Card } from "@/components/card";
import { cn } from "@/lib/cn";
import { referenceSections } from "@/lib/reference";

const sectionIcons: Record<string, typeof BookOpen> = {
  "anti-patterns": BookOpen,
  safety: ShieldCheck,
  "model-differences": Cpu,
};

export function ReferenceClient() {
  const [openEntry, setOpenEntry] = useState<string | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 pt-6 md:pt-10 pb-8">
      <h1 className="text-[22px] font-semibold tracking-tight">Reference</h1>
      <p className="text-muted text-[14px] mt-1.5">
        Quick lookups. Not lessons, just things worth knowing before they matter.
      </p>

      <div className="mt-6 flex flex-col gap-8">
        {referenceSections.map((section) => {
          const Icon = sectionIcons[section.id] ?? BookOpen;
          return (
            <div key={section.id}>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-accent-soft flex items-center justify-center shrink-0">
                  <Icon className="w-[16px] h-[16px] text-accent" />
                </div>
                <h2 className="text-[15.5px] font-semibold">{section.title}</h2>
              </div>
              <p className="text-[13px] text-muted mb-3 pl-[42px]">{section.intro}</p>

              <div className="flex flex-col gap-2">
                {section.entries.map((entry) => {
                  const key = `${section.id}:${entry.title}`;
                  const isOpen = openEntry === key;
                  return (
                    <Card key={key} className="overflow-hidden">
                      <button
                        onClick={() => setOpenEntry(isOpen ? null : key)}
                        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
                      >
                        <span className="text-[14px] font-medium">{entry.title}</span>
                        <CaretDown
                          className={cn(
                            "w-4 h-4 text-muted-soft shrink-0 transition-transform",
                            isOpen && "rotate-180"
                          )}
                         
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4">
                              <p className="text-[13.5px] text-muted leading-relaxed">{entry.body}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

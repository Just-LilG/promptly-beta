"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check } from "@/icons";
import { Card } from "@/components/card";
import { cn } from "@/lib/cn";
import { libraryCategories } from "@/lib/library";

export function LibraryClient() {
  const [activeCategory, setActiveCategory] = useState(libraryCategories[0].slug);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const category = libraryCategories.find((c) => c.slug === activeCategory)!;

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1800);
    } catch {
      // Clipboard API can fail without permission/HTTPS — fail quietly, the text is still selectable.
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 pt-6 md:pt-10 pb-8">
      <h1 className="text-[22px] font-semibold tracking-tight">Prompt Library</h1>
      <p className="text-muted text-[14px] mt-1.5">
        Ready-to-use templates. Copy one, fill in the brackets, send it.
      </p>

      {/* Category tabs - horizontally scrollable on mobile */}
      <div className="flex gap-2 mt-5 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
        {libraryCategories.map((c) => {
          const Icon = c.icon;
          const active = c.slug === activeCategory;
          return (
            <motion.button
              key={c.slug}
              onClick={() => setActiveCategory(c.slug)}
              whileTap={{ scale: 0.94 }}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-pill)] text-[13px] font-medium whitespace-nowrap shrink-0 transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "bg-surface border border-border text-muted"
              )}
            >
              <Icon className="w-[14px] h-[14px]" />
              {c.name}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 flex flex-col gap-3"
        >
          {category.templates.map((t) => {
            const isCopied = copiedId === t.id;
            return (
              <Card key={t.id} className="p-4">
                <p className="text-[14.5px] font-semibold">{t.title}</p>
                <p className="text-[12.5px] text-muted mt-1">{t.useCase}</p>
                <pre className="mt-3 text-[13px] leading-relaxed whitespace-pre-wrap rounded-[var(--radius-sm)] bg-background border border-border p-3 font-sans">
                  {t.prompt}
                </pre>
                <motion.button
                  onClick={() => handleCopy(t.id, t.prompt)}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "mt-3 flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-pill)] text-[13px] font-medium transition-colors",
                    isCopied
                      ? "bg-accent-soft text-accent"
                      : "bg-surface border border-border text-muted"
                  )}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isCopied ? (
                      <motion.span
                        key="copied"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                        className="flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Copied
                      </motion.span>
                    ) : (
                      <motion.span
                        key="copy"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy prompt
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </Card>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";

// A pulsing sparkle trio rather than generic chat-app bouncing dots — ties
// the "thinking" moment back to the accent Sparkle glyph used everywhere
// else in the app for "the AI", instead of a borrowed, identity-less motif.
export function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-accent"
            animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1.15, 0.8] }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
      <span className="text-[13px] text-muted">Thinking</span>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  ArrowsClockwise,
  SpeakerHigh,
  SpeakerX,
  DotsThree,
  PaperPlaneTilt,
  PencilSimple,
} from "@/icons";
import { isSpeechSupported, speak, stopSpeaking } from "@/lib/speech-synthesis";
import { cn } from "@/lib/cn";

function selectedTextInside(container: HTMLElement | null): string {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed || !container) return "";
  const range = sel.getRangeAt(0);
  if (!container.contains(range.commonAncestorContainer)) return "";
  return sel.toString();
}

export function MessageActions({
  content,
  onRegenerate,
  onResend,
  onEdit,
  showRegenerate,
  align = "start",
  children,
  className,
}: {
  content: string;
  onRegenerate?: () => void;
  onResend?: () => void;
  onEdit?: () => void;
  showRegenerate?: boolean;
  align?: "start" | "end";
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const copySlice = useRef("");
  const [copyingSelection, setCopyingSelection] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent | globalThis.TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [open]);

  useEffect(() => {
    if (open) return;
    copySlice.current = "";
    setCopyingSelection(false);
  }, [open]);

  const rememberSlice = () => {
    const slice = selectedTextInside(containerRef.current);
    copySlice.current = slice;
    setCopyingSelection(Boolean(slice));
    return slice;
  };

  const openMenu = (pos: { x: number; y: number } | null) => {
    rememberSlice();
    setMenuPos(pos);
    setOpen(true);
  };

  const handlePressStart = (e: TouchEvent) => {
    const touch = e.changedTouches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    pressTimer.current = setTimeout(() => {
      if (selectedTextInside(containerRef.current)) return;
      openMenu(null);
    }, 450);
  };
  const handlePressMove = (e: TouchEvent) => {
    const start = touchStart.current;
    if (!start || !pressTimer.current) return;
    const touch = e.changedTouches[0] ?? e.touches[0];
    if (!touch) return;
    if (Math.abs(touch.clientX - start.x) > 8 || Math.abs(touch.clientY - start.y) > 8) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };
  const handlePressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = null;
    touchStart.current = null;
  };

  const handleCopy = async () => {
    const text = copySlice.current.trim() || selectedTextInside(containerRef.current).trim() || content;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 900);
    } catch {
      // clipboard unavailable — fail quietly
    }
  };

  const handleToggleSpeak = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    speak(content, { onEnd: () => setSpeaking(false), onError: () => setSpeaking(false) });
    setSpeaking(true);
  };

  useEffect(() => {
    return () => {
      if (speaking) stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const itemClass =
    "flex w-full items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] text-[13px] font-medium text-left active:bg-background";

  return (
    <div
      ref={containerRef}
      className={cn("relative w-fit max-w-full", className)}
      onTouchStart={handlePressStart}
      onTouchMove={handlePressMove}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
      onContextMenu={(e) => {
        const slice = rememberSlice();
        if (slice) return;
        e.preventDefault();
        setMenuPos({ x: e.clientX, y: e.clientY });
        setOpen(true);
      }}
    >
      {children}
      <button
        type="button"
        aria-label="Message actions"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          rememberSlice();
          setMenuPos(null);
          setOpen((was) => !was);
        }}
        className={cn(
          "absolute top-0.5 h-7 w-7 flex items-center justify-center rounded-full",
          align === "end"
            ? "-left-8 text-muted"
            : "-right-8 text-muted"
        )}
      >
        <DotsThree className="w-[18px] h-[18px]" weight="bold" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: menuPos ? 0 : 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col min-w-[10.5rem] p-1 rounded-[var(--radius-md)] bg-surface-raised border border-border card-shadow"
            style={
              menuPos
                ? { position: "fixed", left: menuPos.x, top: menuPos.y, zIndex: 70 }
                : {
                    position: "absolute",
                    top: 28,
                    [align === "end" ? "right" : "left"]: 0,
                    zIndex: 20,
                  }
            }
          >
            <button type="button" onClick={() => void handleCopy()} className={itemClass}>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-accent" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-muted" />
              )}
              {copied ? "Copied" : copyingSelection ? "Copy selected" : "Copy"}
            </button>
            {isSpeechSupported() && (
              <button
                type="button"
                onClick={() => {
                  handleToggleSpeak();
                  setOpen(false);
                }}
                className={itemClass}
              >
                {speaking ? (
                  <SpeakerX className="w-3.5 h-3.5 text-muted" />
                ) : (
                  <SpeakerHigh className="w-3.5 h-3.5 text-muted" />
                )}
                {speaking ? "Stop reading" : "Read aloud"}
              </button>
            )}
            {onResend && (
              <button
                type="button"
                onClick={() => {
                  onResend();
                  setOpen(false);
                }}
                className={itemClass}
              >
                <PaperPlaneTilt className="w-3.5 h-3.5 text-muted" />
                Resend
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onEdit();
                  setOpen(false);
                }}
                className={itemClass}
              >
                <PencilSimple className="w-3.5 h-3.5 text-muted" />
                Edit
              </button>
            )}
            {showRegenerate && onRegenerate && (
              <button
                type="button"
                onClick={() => {
                  onRegenerate();
                  setOpen(false);
                }}
                className={itemClass}
              >
                <ArrowsClockwise className="w-3.5 h-3.5 text-muted" />
                Regenerate
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

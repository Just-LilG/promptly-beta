"use client";

// Send's full chat interface. Built entirely from the app's existing visual
// vocabulary (chat-bubble tails, the sandbox composer, HistoryPanel-style
// slide-in panel, fly-to-chat send animation, MessageActions-style
// long-press menu) rather than a parallel design system -- this should feel
// like the same app, not a bolted-on feature.
//
// Data is MOCK (see send-mock-data.ts) since the real backend -- Neon
// message storage, signed-in posting, a live-or-poll wire, moderation --
// isn't built yet (PROJECT_PLAN.md). The interface is fully real and
// interactive against that mock state, so this is an honest, working
// preview rather than static comps. Swap MOCK_MESSAGES / send logic for
// real API calls later; the bubble/menu/composer markup shouldn't need to
// change shape when that happens.

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CaretLeft,
  DotsThree,
  Plus,
  ArrowUp,
  Copy,
  Check,
  Trash,
  X,
  ShieldCheck,
} from "@/icons";
import { cn } from "@/lib/cn";
import { UserAvatar } from "@/components/user-avatar";
import { dicebearUrl } from "@/lib/avatar";
import {
  MOCK_MESSAGES,
  MOCK_PARTICIPANTS,
  MOCK_ROOM_NAME,
  type MockMessage,
} from "@/lib/send-mock-data";

function participantFor(id: string) {
  return MOCK_PARTICIPANTS.find((p) => p.id === id) ?? null;
}

function formatTime(at: number) {
  return new Date(at).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDayLabel(at: number) {
  const d = new Date(at);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

// Deterministic per-sender bubble tint so each person's messages read as
// distinct in a group room without inventing a color system separate from
// the app's own accent palette -- every tint is a mix against --accent at
// varying strength, so it always harmonizes.
const SENDER_TINTS = [
  "color-mix(in srgb, var(--accent) 14%, var(--surface))",
  "color-mix(in srgb, #7c6df0 14%, var(--surface))",
  "color-mix(in srgb, #f0a63d 14%, var(--surface))",
];
function tintFor(senderId: string) {
  const idx = MOCK_PARTICIPANTS.findIndex((p) => p.id === senderId);
  return SENDER_TINTS[idx < 0 ? 0 : idx % SENDER_TINTS.length];
}

export function SendClient() {
  const [messages, setMessages] = useState<MockMessage[]>(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const [composerFocused, setComposerFocused] = useState(false);
  const [replyTarget, setReplyTarget] = useState<MockMessage | null>(null);
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [typingFrom, setTypingFrom] = useState<string | null>(null);
  const [flying, setFlying] = useState<{
    text: string;
    startTop: number;
    startLeft: number;
    startWidth: number;
    endTop: number;
    endLeft: number;
  } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const canSend = input.trim().length > 0;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  // A single, honest simulation of another participant replying -- this is
  // the one piece of "liveness" in the mock, clearly driven by a timer
  // rather than pretending to be a real socket connection.
  useEffect(() => {
    if (messages.length === 0 || messages[messages.length - 1].senderId !== "me") return;
    const responder = MOCK_PARTICIPANTS[Math.floor(Math.random() * MOCK_PARTICIPANTS.length)];
    const typingTimer = setTimeout(() => setTypingFrom(responder.id), 700);
    const replyTimer = setTimeout(() => {
      setTypingFrom(null);
      setMessages((prev) => [
        ...prev,
        {
          id: `mock-${Date.now()}`,
          senderId: responder.id,
          text: pickAutoReply(),
          at: Date.now(),
        },
      ]);
    }, 2200);
    return () => {
      clearTimeout(typingTimer);
      clearTimeout(replyTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  const grouped = useMemo(() => {
    const withDayLabels: { dayLabel?: string; message: MockMessage }[] = [];
    let lastDay = "";
    for (const m of messages) {
      const day = formatDayLabel(m.at);
      if (day !== lastDay) {
        withDayLabels.push({ dayLabel: day, message: m });
        lastDay = day;
      } else {
        withDayLabels.push({ message: m });
      }
    }
    return withDayLabels;
  }, [messages]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;

    // Fly-to-chat: mirrors Sandbox's send animation so the composer text
    // visibly travels into the message list instead of just appearing.
    const composerEl = composerRef.current;
    const scrollEl = scrollRef.current;
    if (composerEl && scrollEl) {
      const startRect = composerEl.getBoundingClientRect();
      const endRect = scrollEl.getBoundingClientRect();
      setFlying({
        text,
        startTop: startRect.top,
        startLeft: startRect.left,
        startWidth: startRect.width,
        endTop: endRect.bottom - 60,
        endLeft: endRect.right - startRect.width - 8,
      });
      setTimeout(() => setFlying(null), 420);
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `me-${Date.now()}`,
        senderId: "me",
        text,
        at: Date.now(),
        replyTo: replyTarget?.id,
      },
    ]);
    setInput("");
    setReplyTarget(null);
    inputRef.current?.focus();
  }

  return (
    <div className="flex flex-col h-[100dvh]">
      {/* Topbar -- mirrors Sandbox's header structure (title + subtitle left,
          icon actions right) so Send reads as a sibling screen, not a
          different app bolted on. */}
      <div className="flex items-center justify-between px-4 pt-6 pb-3 shrink-0 border-b border-border">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href="/"
            aria-label="Back"
            className="flex items-center justify-center w-9 h-9 rounded-full border border-border text-muted-soft shrink-0 active:scale-[0.92] transition-transform"
          >
            <CaretLeft className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setShowMembers(true)}
            className="flex items-center gap-2.5 min-w-0 text-left"
          >
            <div className="flex -space-x-2 shrink-0">
              {MOCK_PARTICIPANTS.slice(0, 3).map((p) => (
                <img
                  key={p.id}
                  src={dicebearUrl("notionists", p.colorSeed)}
                  alt=""
                  className="w-7 h-7 rounded-full border-2 border-background object-cover"
                />
              ))}
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold truncate">{MOCK_ROOM_NAME}</p>
              <p className="text-[12px] text-muted truncate">
                {typingFrom
                  ? `${participantFor(typingFrom)?.name.split(" ")[0]} is typing...`
                  : `${MOCK_PARTICIPANTS.length + 1} people`}
              </p>
            </div>
          </button>
        </div>
        <button
          onClick={() => setShowMembers(true)}
          aria-label="Room info"
          className="p-2.5 rounded-[var(--radius-pill)] bg-surface border border-border shrink-0"
        >
          <DotsThree className="w-4 h-4 text-muted" weight="bold" />
        </button>
      </div>

      {/* Message list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto flex flex-col px-3 pb-3 pt-2 min-h-0"
      >
        {grouped.map(({ dayLabel, message: m }, i) => {
          const isMe = m.senderId === "me";
          const sender = isMe ? null : participantFor(m.senderId);
          const prev = grouped[i - 1]?.message;
          const next = grouped[i + 1]?.message;
          const prevSameSender = !dayLabel && prev && prev.senderId === m.senderId;
          const nextSameSender = next && next.senderId === m.senderId && !grouped[i + 1]?.dayLabel;
          const showAvatar = !isMe && !nextSameSender;
          const replySource = m.replyTo ? messages.find((x) => x.id === m.replyTo) : null;

          return (
            <div key={m.id}>
              {dayLabel && (
                <div className="flex items-center justify-center my-3">
                  <span className="text-[11px] font-medium text-muted-soft bg-surface px-2.5 py-1 rounded-full border border-border">
                    {dayLabel}
                  </span>
                </div>
              )}
              <div
                className={cn(
                  "flex w-full items-end gap-1.5",
                  isMe ? "justify-end pl-12" : "justify-start pr-12",
                  prevSameSender ? "mt-[2px]" : "mt-2.5"
                )}
              >
                {!isMe && (
                  <div className="w-6 h-6 shrink-0 self-end">
                    {showAvatar && sender && (
                      <img
                        src={dicebearUrl("notionists", sender.colorSeed)}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                  </div>
                )}

                <div className={cn("flex flex-col max-w-[76%] min-w-0", isMe ? "items-end" : "items-start")}>
                  {!isMe && !prevSameSender && sender && (
                    <span className="text-[11.5px] font-semibold text-muted px-1 mb-0.5">
                      {sender.name}
                    </span>
                  )}

                  <SendBubble
                    message={m}
                    isMe={isMe}
                    prevSameSender={!!prevSameSender}
                    nextSameSender={!!nextSameSender}
                    tint={!isMe ? tintFor(m.senderId) : undefined}
                    replySource={replySource}
                    replySourceSenderName={
                      replySource
                        ? replySource.senderId === "me"
                          ? "You"
                          : participantFor(replySource.senderId)?.name ?? "Someone"
                        : undefined
                    }
                    menuOpen={menuOpenFor === m.id}
                    onOpenMenu={() => setMenuOpenFor(m.id)}
                    onCloseMenu={() => setMenuOpenFor(null)}
                    onReply={() => {
                      setReplyTarget(m);
                      setMenuOpenFor(null);
                      inputRef.current?.focus();
                    }}
                    onDelete={
                      isMe
                        ? () => {
                            setMessages((prev) => prev.filter((x) => x.id !== m.id));
                            setMenuOpenFor(null);
                          }
                        : undefined
                    }
                  />
                  <span className="text-[10.5px] text-muted-soft px-1 mt-0.5">
                    {formatTime(m.at)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {typingFrom && (
          <div className="flex items-end gap-1.5 justify-start pr-12 mt-2.5">
            <img
              src={dicebearUrl("notionists", participantFor(typingFrom)?.colorSeed ?? "x")}
              alt=""
              className="w-6 h-6 rounded-full object-cover shrink-0"
            />
            <div className="chat-bubble chat-bubble-ai bg-surface rounded-[var(--radius-md)] rounded-bl-[4px] px-3 py-2.5">
              <TypingDots />
            </div>
          </div>
        )}
      </div>

      {/* Composer -- deliberately mirrors Sandbox's composer shell (rounded
          card, focus ring, bottom action row) so switching between the two
          screens doesn't feel like switching apps. */}
      <div className="px-3 pb-3 pt-1 shrink-0">
        <AnimatePresence>
          {replyTarget && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 px-3 py-2 mb-1.5 rounded-[var(--radius-md)] bg-surface border border-border border-l-2 border-l-accent">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-accent">
                    Replying to {replyTarget.senderId === "me" ? "yourself" : participantFor(replyTarget.senderId)?.name}
                  </p>
                  <p className="text-[12px] text-muted truncate">{replyTarget.text}</p>
                </div>
                <button
                  onClick={() => setReplyTarget(null)}
                  aria-label="Cancel reply"
                  className="p-1.5 rounded-full shrink-0"
                >
                  <X className="w-3.5 h-3.5 text-muted-soft" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          ref={composerRef}
          className={cn(
            "sandbox-composer w-full min-w-0 rounded-[var(--radius-lg)] bg-surface border transition-colors",
            composerFocused ? "border-accent" : "border-border"
          )}
        >
          <div className="flex items-end">
            <button
              type="button"
              aria-label="Add to message"
              className="h-11 w-11 flex items-center justify-center rounded-full shrink-0 m-0.5"
            >
              <Plus className="w-4 h-4 text-muted" />
            </button>
            <textarea
              ref={inputRef}
              value={input}
              rows={1}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setComposerFocused(true)}
              onBlur={() => setComposerFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message the room..."
              className="block flex-1 min-w-0 resize-none bg-transparent text-[16px] outline-none disabled:opacity-60 px-1.5 pt-2.5 pb-1 leading-[1.45] overflow-y-auto min-h-10 max-h-32"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              aria-label="Send"
              className={cn(
                "h-11 w-11 flex items-center justify-center rounded-full shrink-0 m-0.5 transition-colors",
                canSend ? "bg-accent text-accent-foreground" : "bg-transparent text-muted-soft"
              )}
            >
              <ArrowUp className="w-5 h-5" weight="bold" />
            </button>
          </div>
        </div>
      </div>

      {/* Members / room info slide-up -- same full-screen slide pattern as
          HistoryPanel. */}
      <AnimatePresence>
        {showMembers && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[60] flex flex-col bg-background"
          >
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
              <div>
                <p className="text-[15px] font-semibold">{MOCK_ROOM_NAME}</p>
                <p className="text-[12px] text-muted mt-0.5">
                  {MOCK_PARTICIPANTS.length + 1} people
                </p>
              </div>
              <button onClick={() => setShowMembers(false)} className="p-1.5" aria-label="Close">
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] bg-surface border border-border mb-2">
                <UserAvatar className="w-10 h-10 rounded-full shrink-0" />
                <div className="min-w-0">
                  <p className="text-[13.5px] font-medium truncate">You</p>
                  <p className="text-[12px] text-muted">In this room</p>
                </div>
              </div>
              {MOCK_PARTICIPANTS.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] bg-surface border border-border mb-2"
                >
                  <img
                    src={dicebearUrl("notionists", p.colorSeed)}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-medium truncate">{p.name}</p>
                    <p className="text-[12px] text-muted">Member</p>
                  </div>
                </div>
              ))}

              <div className="mt-5 flex items-start gap-2.5 p-3 rounded-[var(--radius-lg)] bg-surface border border-border">
                <ShieldCheck className="w-4 h-4 text-muted-soft shrink-0 mt-0.5" />
                <p className="text-[12.5px] text-muted leading-relaxed">
                  This is a preview of Send. Messages here aren't saved or sent to real
                  people yet -- moderation and real accounts are still being built.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fly-to-chat send animation -- identical technique to Sandbox's. */}
      {flying && (
        <div
          className="fixed z-[70] pointer-events-none rounded-[var(--radius-lg)] bg-accent text-accent-foreground text-[14px] leading-relaxed px-3.5 py-2.5 truncate"
          style={{
            top: flying.startTop,
            left: flying.startLeft,
            width: flying.startWidth,
            animation: "fly-to-chat 0.4s cubic-bezier(0.34, 1.2, 0.64, 1) forwards",
            ["--fly-distance" as string]: `${flying.endTop - flying.startTop}px`,
            ["--fly-x" as string]: `${flying.endLeft - flying.startLeft}px`,
          }}
        >
          {flying.text}
        </div>
      )}
    </div>
  );
}

function pickAutoReply(): string {
  const options = [
    "makes sense!",
    "oh good point",
    "trying it now",
    "nice, that tracks with what I saw too",
    "haha yeah exactly",
  ];
  return options[Math.floor(Math.random() * options.length)];
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-muted-soft"
          animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1.15, 0.8] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

// Individual bubble + its own long-press / right-click action menu. Split
// out from the main render loop so each bubble owns its own press-timer and
// menu state, mirroring how MessageActions.tsx isolates that logic in
// Sandbox.
function SendBubble({
  message,
  isMe,
  prevSameSender,
  nextSameSender,
  tint,
  replySource,
  replySourceSenderName,
  menuOpen,
  onOpenMenu,
  onCloseMenu,
  onReply,
  onDelete,
}: {
  message: MockMessage;
  isMe: boolean;
  prevSameSender: boolean;
  nextSameSender: boolean;
  tint?: string;
  replySource?: MockMessage | null;
  replySourceSenderName?: string;
  menuOpen: boolean;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  onReply: () => void;
  onDelete?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e: MouseEvent | globalThis.TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onCloseMenu();
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [menuOpen, onCloseMenu]);

  const handlePressStart = (e: ReactTouchEvent) => {
    const touch = e.changedTouches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    pressTimer.current = setTimeout(onOpenMenu, 450);
  };
  const handlePressMove = (e: ReactTouchEvent) => {
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
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onCloseMenu();
      }, 800);
    } catch {
      // clipboard unavailable -- fail quietly
    }
  };

  const itemClass =
    "flex w-full items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] text-[13px] font-medium text-left active:bg-background";

  return (
    <div
      ref={containerRef}
      className="relative w-fit max-w-full"
      onTouchStart={handlePressStart}
      onTouchMove={handlePressMove}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
      onContextMenu={(e) => {
        e.preventDefault();
        onOpenMenu();
      }}
      onDoubleClick={onOpenMenu}
    >
      <div
        className={cn(
          "chat-bubble px-3 py-1.5 text-[14.5px] leading-[1.35]",
          isMe
            ? "chat-bubble-user bg-accent text-accent-foreground whitespace-pre-wrap"
            : "chat-bubble-ai whitespace-pre-wrap",
          isMe ? "rounded-[var(--radius-md)] rounded-br-[4px]" : "rounded-[var(--radius-md)] rounded-bl-[4px]",
          isMe && nextSameSender && "rounded-br-[12px] [&::after]:hidden",
          isMe && prevSameSender && "rounded-tr-[4px]",
          !isMe && nextSameSender && "rounded-bl-[12px] [&::after]:hidden",
          !isMe && prevSameSender && "rounded-tl-[4px]"
        )}
        style={
          !isMe
            ? { background: tint, ["--chat-bubble-ai-tint" as string]: tint }
            : undefined
        }
      >
        {replySource && (
          <div
            className={cn(
              "mb-1.5 px-2 py-1 rounded-[var(--radius-sm)] border-l-2 text-[12px] leading-snug",
              isMe
                ? "bg-accent-foreground/10 border-l-accent-foreground/50 text-accent-foreground/85"
                : "bg-background border-l-muted-soft text-muted"
            )}
          >
            <p className="font-semibold">{replySourceSenderName}</p>
            <p className="truncate max-w-[220px]">{replySource.text}</p>
          </div>
        )}
        {message.text}
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="absolute z-20 flex flex-col min-w-[9.5rem] p-1 rounded-[var(--radius-md)] bg-surface-raised border border-border card-shadow"
            style={{ top: "calc(100% + 4px)", [isMe ? "right" : "left"]: 0 }}
          >
            <button type="button" onClick={() => void handleCopy()} className={itemClass}>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-accent" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-muted" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
            <button type="button" onClick={onReply} className={itemClass}>
              <CaretLeft className="w-3.5 h-3.5 text-muted scale-x-[-1]" />
              Reply
            </button>
            {onDelete && (
              <button type="button" onClick={onDelete} className={cn(itemClass, "text-danger")}>
                <Trash className="w-3.5 h-3.5" />
                Delete
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

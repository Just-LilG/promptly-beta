"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Sparkle,
  ArrowUp,
  ArrowCounterClockwise,
  Cpu,
  CloudCheck,
  DeviceMobile,
  Stop,
  ClockCounterClockwise,
  Plus,
  CaretDown,
  Microphone,
  FlowArrow,
  MagicWand,
  Paperclip,
  X,
  FileText,
  ImageSquare,
} from "@/icons";
import { Card } from "@/components/card";
import { cn } from "@/lib/cn";
import { useLocalTutor } from "@/lib/use-local-tutor";
import { useApiTutor } from "@/lib/use-api-tutor";
import { useProviderStatus } from "@/lib/use-provider-status";
import { ModelPicker } from "@/components/model-picker";
import { getAIEnginePreference, setAIEnginePreference, type AIEngine } from "@/lib/ai-engine-preference";
import { AGENT_MODULES, PIPELINE_STEPS, getModule } from "@/lib/agent-modules";
import { MarkdownContent } from "@/components/markdown-content";
import { MessageActions } from "@/components/message-actions";
import { ThinkingIndicator } from "@/components/thinking-indicator";
import { HistoryPanel } from "@/components/history-panel";
import { ModulePicker, type SelectionMode } from "@/components/module-picker";
import { useVoiceInput, isVoiceInputSupported } from "@/lib/use-voice-input";
import {
  listConversations,
  saveConversation,
  deleteConversation,
  getConversation,
  type Conversation,
} from "@/lib/conversations";
import { attachChromeScrollSource } from "@/lib/scroll-hide-bus";
import {
  ATTACH_ACCEPT,
  MAX_ATTACHMENTS,
  attachmentsNeedVision,
  fileToAttachment,
  revokeAttachment,
  type ChatAttachment,
} from "@/lib/chat-attachments";

const DRAFT_KEY = "promptly:sandbox-draft";
const SELECTION_KEY = "promptly:sandbox-selection";
const PROVIDER_KEY = "promptly:sandbox-provider";

function readProviderChoice(): string {
  if (typeof window === "undefined") return "auto";
  try {
    return window.localStorage.getItem(PROVIDER_KEY) ?? "auto";
  } catch {
    return "auto";
  }
}

function readSelection(): SelectionMode {
  if (typeof window === "undefined") return { kind: "single", moduleId: "coach" };
  try {
    const raw = window.localStorage.getItem(SELECTION_KEY);
    if (!raw) return { kind: "single", moduleId: "coach" };
    const parsed = JSON.parse(raw) as SelectionMode;
    if (parsed.kind === "pipeline") return parsed;
    if (parsed.kind === "single" && AGENT_MODULES.some((m) => m.id === parsed.moduleId)) return parsed;
    return { kind: "single", moduleId: "coach" };
  } catch {
    return { kind: "single", moduleId: "coach" };
  }
}

export function SandboxClient() {
  const [selection, setSelection] = useState<SelectionMode>(() => readSelection());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [engine, setEngine] = useState<AIEngine>(() =>
    typeof window === "undefined" ? "local" : getAIEnginePreference()
  );
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    typeof window === "undefined" ? [] : listConversations()
  );
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  // A pipeline run keeps its own transient label per assistant message
  // ("Critic" / "Rewriter") so the transcript reads as two agents talking,
  // not one. Keyed by message index.
  const [pipelineLabels, setPipelineLabels] = useState<Record<number, string>>({});
  const [providerChoice, setProviderChoice] = useState<string>(() => readProviderChoice());
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const providerStatus = useProviderStatus();

  useEffect(() => {
    try {
      window.localStorage.setItem(PROVIDER_KEY, providerChoice);
    } catch {
      // non-critical
    }
  }, [providerChoice]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SELECTION_KEY, JSON.stringify(selection));
    } catch {
      // non-critical
    }
  }, [selection]);

  const handleEngineChange = (next: AIEngine) => {
    setEngine(next);
    setAIEnginePreference(next);
  };

  // Single-module system prompt (used directly for local/api "send"). In
  // pipeline mode this is unused for sending — each step supplies its own
  // system prompt — but a module is still needed as a stable hook argument.
  const activeSystemPrompt =
    selection.kind === "single" ? getModule(selection.moduleId).systemPrompt : getModule("coach").systemPrompt;

  const local = useLocalTutor(activeSystemPrompt);
  const api = useApiTutor(activeSystemPrompt, providerChoice);

  const active = engine === "local" ? local : api;
  const { messages, isGenerating, send, replay, clear, stop, loadMessages } = active;
  const lastProviderUsed = engine === "api" ? api.lastProviderUsed : null;
  const loadState = engine === "local" ? local.loadState : ({ status: "ready" } as const);
  const load = engine === "local" ? local.load : () => {};

  const [input, setInput] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return window.localStorage.getItem(DRAFT_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<ChatAttachment[]>([]);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [dragDepth, setDragDepth] = useState(0);
  const draggingOver = dragDepth > 0;
  const [composerFocused, setComposerFocused] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    return attachChromeScrollSource(el, { minPositionForHide: 0 });
  }, []);
  const [flyingText, setFlyingText] = useState<{
    text: string;
    startTop: number;
    startLeft: number;
    startWidth: number;
    endTop: number;
    endLeft: number;
  } | null>(null);

  const voiceBaseRef = useRef("");
  const voice = useVoiceInput((text, isFinal) => {
    // While speaking, the base is whatever text existed before this
    // utterance started; interim results replace the live tail, and a
    // final result commits it into the base for the next utterance.
    if (isFinal) {
      voiceBaseRef.current = `${voiceBaseRef.current}${text} `;
      setInput(voiceBaseRef.current);
    } else {
      setInput(`${voiceBaseRef.current}${text}`);
    }
  });
  const listening = voice.state === "listening";

  const handleToggleVoice = () => {
    if (voice.state === "listening") {
      voice.stop();
      return;
    }
    voiceBaseRef.current = input ? `${input} ` : "";
    voice.start();
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_KEY, input);
    } catch {
      // non-critical
    }
  }, [input]);

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 40), 200)}px`;
  }, [input, pendingFiles.length, listening]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Autosave the conversation to history on every message change — including
  // mid-stream — so navigating away while a response is still generating
  // never loses it. localStorage writes are cheap enough for this frequency.
  const activeConvIdRef = useRef(activeConvId);
  useEffect(() => {
    activeConvIdRef.current = activeConvId;
  });

  useEffect(() => {
    if (messages.length === 0) return;
    const id = saveConversation(activeConvIdRef.current, messages);
    if (id && id !== activeConvIdRef.current) setActiveConvId(id);
    setConversations(listConversations());
  }, [messages]);

  // Belt-and-suspenders: also save on unmount (e.g. navigating to another tab
  // mid-generation), using the latest messages via a ref so this doesn't need
  // messages in its own dependency array and re-run needlessly.
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  });
  useEffect(() => {
    return () => {
      if (messagesRef.current.length > 0) {
        saveConversation(activeConvIdRef.current, messagesRef.current);
      }
    };
  }, []);

  const runFlyAnimation = (text: string) => {
    const inputRect = inputRef.current?.getBoundingClientRect();
    const listRect = scrollRef.current?.getBoundingClientRect();
    if (inputRect && listRect) {
      setFlyingText({
        text,
        startTop: inputRect.top,
        startLeft: inputRect.left,
        startWidth: Math.min(inputRect.width, listRect.width * 0.8),
        endTop: listRect.bottom - 40,
        endLeft: listRect.right - Math.min(inputRect.width, listRect.width * 0.8) - 8,
      });
      setTimeout(() => setFlyingText(null), 420);
    }
  };

  const addFiles = async (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    if (incoming.length === 0) return;
    setAttachError(null);
    const room = MAX_ATTACHMENTS - pendingFiles.length;
    if (room <= 0) {
      setAttachError(`You can attach up to ${MAX_ATTACHMENTS} files at a time.`);
      return;
    }
    const next: ChatAttachment[] = [...pendingFiles];
    for (const file of incoming.slice(0, room)) {
      try {
        next.push(await fileToAttachment(file));
      } catch (err) {
        setAttachError(err instanceof Error ? err.message : "Could not add that file.");
      }
    }
    if (incoming.length > room) {
      setAttachError(`You can attach up to ${MAX_ATTACHMENTS} files at a time.`);
    }
    setPendingFiles(next);
  };

  const removePending = (id: string) => {
    setPendingFiles((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target) revokeAttachment(target);
      return prev.filter((a) => a.id !== id);
    });
  };

  const handleSend = async () => {
    if ((!input.trim() && pendingFiles.length === 0) || isGenerating) return;
    const text = input.trim();
    const attached = pendingFiles;
    if (voice.state === "listening") voice.stop();

    if (text) runFlyAnimation(text);
    setInput("");
    setPendingFiles([]);
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // non-critical
    }

    if (selection.kind === "single") {
      send(text, undefined, attached);
      return;
    }

    // Pipeline mode is Cloud-only (see the notice shown when Local is active
    // with pipeline selected) — `api.send` is always the right hook here.
    const criticPrompt = getModule(PIPELINE_STEPS[0]).systemPrompt;
    const rewriterPrompt = getModule(PIPELINE_STEPS[1]).systemPrompt;

    setPipelineLabels((prev) => ({ ...prev, [api.messages.length + 1]: "Critic" }));
    const criticOutput = await api.send(text, criticPrompt, attached);

    setPipelineLabels((prev) => ({ ...prev, [api.messages.length + 2]: "Rewriter" }));
    await api.send(`Original prompt:\n${text}\n\nWeaknesses found:\n${criticOutput}`, rewriterPrompt);
  };

  const handleNewConversation = () => {
    pendingFiles.forEach(revokeAttachment);
    setPendingFiles([]);
    setAttachError(null);
    clear();
    setActiveConvId(null);
    setInput("");
    setPipelineLabels({});
  };

  const handleSelectConversation = (id: string) => {
    const conv = getConversation(id);
    if (conv) {
      loadMessages(conv.messages);
      setActiveConvId(id);
    }
    setShowHistory(false);
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id);
    setConversations(listConversations());
    if (id === activeConvId) {
      clear();
      setActiveConvId(null);
    }
  };

  const selectionLabel =
    selection.kind === "pipeline" ? "Pipeline" : getModule(selection.moduleId).name;

  const canSend =
    (Boolean(input.trim()) || pendingFiles.length > 0) &&
    !(engine === "local" && loadState.status !== "ready");

  return (
    <div
      className="relative max-w-3xl mx-auto px-3 md:px-8 pt-6 md:pt-10 flex flex-col h-[calc(var(--app-height,100dvh)-var(--top-chrome,0px)-var(--bottom-chrome,5.5rem))] md:h-[calc(100dvh-2rem)]"
      onDragEnter={(e) => {
        e.preventDefault();
        if (![...e.dataTransfer.types].includes("Files")) return;
        setDragDepth(1);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setDragDepth(0);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragDepth(0);
        if (e.dataTransfer.files?.length) void addFiles(e.dataTransfer.files);
      }}
    >
      {draggingOver && (
        <div className="sandbox-drop-overlay pointer-events-none absolute inset-2 z-30 flex flex-col items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed border-accent bg-accent-soft/80">
          <Paperclip className="w-8 h-8 text-accent" />
          <p className="mt-2 text-[15px] font-semibold">Drop files here</p>
          <p className="text-[13px] text-muted mt-0.5">Images, PDFs, or text. Up to {MAX_ATTACHMENTS}.</p>
        </div>
      )}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="min-w-0">
          <h1 className="text-[20px] font-semibold tracking-tight">Sandbox</h1>
          <p className="text-muted text-[13px] mt-0.5 truncate">
            {engine === "local"
              ? "Runs a small AI model right in your browser."
              : "Uses a full-size AI model via a cloud request."}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleNewConversation}
            className="p-2.5 rounded-[var(--radius-pill)] bg-surface border border-border"
            aria-label="New conversation"
          >
            <Plus className="w-4 h-4 text-muted" />
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="p-2.5 rounded-[var(--radius-pill)] bg-surface border border-border"
            aria-label="History"
          >
            <ClockCounterClockwise className="w-4 h-4 text-muted" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
        <div className="relative">
          <button
            onClick={() => setPickerOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--radius-pill)] bg-surface border border-border text-[13px] font-medium"
          >
            {selection.kind === "pipeline" ? (
              <FlowArrow className="w-3.5 h-3.5 text-accent" />
            ) : (
              <Sparkle className="w-3.5 h-3.5 text-accent" />
            )}
            {selectionLabel}
            <CaretDown className="w-3 h-3 text-muted-soft" />
          </button>
          <ModulePicker
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            selection={selection}
            onSelect={setSelection}
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-[var(--radius-pill)] bg-surface border border-border w-fit shrink-0">
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
            Cloud
          </button>
        </div>
      </div>

      {selection.kind === "pipeline" && engine === "local" && (
        <Card className="p-3 mb-3 flex items-center gap-2.5 shrink-0">
          <FlowArrow className="w-4 h-4 text-muted-soft shrink-0" />
          <p className="text-[12.5px] text-muted leading-snug">
            Pipeline mode currently runs on Cloud. Switch engines above to use it.
          </p>
        </Card>
      )}

      {engine === "local" && loadState.status === "unsupported" && (
        <Card className="p-5 flex flex-col items-center justify-center text-center gap-2 mb-3">
          <Cpu className="w-6 h-6 text-muted-soft" />
          <p className="text-[14px] font-medium">This device can&apos;t run the local AI</p>
          <p className="text-[13px] text-muted max-w-xs">
            The local engine needs WebGPU, which isn&apos;t available in this browser. Try switching
            to the Cloud engine above instead.
          </p>
        </Card>
      )}

      {engine === "local" && loadState.status === "idle" && (
        <Card className="p-5 flex flex-col items-center justify-center text-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-[var(--radius-md)] bg-accent-soft flex items-center justify-center">
            <Sparkle className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-[14px] font-medium">Load the local AI tutor</p>
            <p className="text-[13px] text-muted mt-1 max-w-xs">
              First load downloads the model to your browser (~1GB) and caches it.
            </p>
          </div>
          <button
            onClick={load}
            className="px-4 py-2.5 rounded-[var(--radius-pill)] bg-accent text-accent-foreground text-[13.5px] font-medium active:scale-95 transition-transform"
          >
            Load model
          </button>
        </Card>
      )}

      {engine === "local" && loadState.status === "loading" && (
        <Card className="p-5 flex flex-col items-center justify-center text-center gap-3 mb-3">
          <div className="w-full max-w-xs h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${Math.round(loadState.progress * 100)}%` }}
            />
          </div>
          <p className="text-[13px] text-muted">{loadState.text}</p>
        </Card>
      )}

      {engine === "local" && loadState.status === "error" && (
        <Card className="p-5 flex flex-col items-center justify-center text-center gap-3 mb-3">
          <p className="text-[14px] font-medium text-danger">Couldn&apos;t load the model</p>
          <p className="text-[13px] text-muted max-w-xs">{loadState.message}</p>
          <button
            onClick={load}
            className="px-4 py-2.5 rounded-[var(--radius-pill)] bg-surface border border-border text-[13.5px] font-medium active:scale-95 transition-transform"
          >
            Try again
          </button>
        </Card>
      )}

      <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto flex flex-col px-2 pb-3 min-h-0"
        >
          {messages.length === 0 && (
            <Card className="p-4 mb-2">
              <p className="text-[13.5px] text-muted leading-relaxed">
                {selection.kind === "pipeline"
                  ? "Write a prompt and Critic will find its weaknesses, then Rewriter will fix them. Two agents, one pipeline."
                  : selection.moduleId === "coach"
                    ? "Paste a prompt you're thinking of using and I'll help you sharpen it. Or just ask a question about prompting."
                    : selection.moduleId === "plain"
                      ? "Type a prompt like you'd send it for real. I'll respond exactly to what you wrote, with no filling in gaps you didn't specify."
                      : "Send a prompt to try this module."}
              </p>
            </Card>
          )}
          {messages.map((m, i) => {
            const isLast = i === messages.length - 1;
            const isEmpty = !m.content;
            const canShowActions = m.content && !(isGenerating && isLast);
            const prevSameRole = i > 0 && messages[i - 1].role === m.role;
            const nextSameRole = i < messages.length - 1 && messages[i + 1].role === m.role;
            const pipelineLabel = pipelineLabels[i];

            // Grouping like a real texting app: tight gap within a run of the
            // same sender, a bigger gap between senders, and the corner
            // nearest the "tail" side squared off only on the last bubble of
            // a run so consecutive bubbles from one sender visually merge.
            const isUser = m.role === "user";
            const bubble = (
              <div
                className={cn(
                  "chat-bubble px-3 py-1.5 text-[14.5px] leading-[1.35]",
                  isUser
                    ? "chat-bubble-user bg-accent text-accent-foreground whitespace-pre-wrap"
                    : "chat-bubble-ai bg-surface",
                  // WhatsApp grouping: last bubble in a run keeps the tail;
                  // earlier ones square off the tail corner so they stack.
                  isUser ? "rounded-[var(--radius-md)] rounded-br-[4px]" : "rounded-[var(--radius-md)] rounded-bl-[4px]",
                  isUser && nextSameRole && "rounded-br-[12px] [&::after]:hidden",
                  isUser && prevSameRole && "rounded-tr-[4px]",
                  !isUser && nextSameRole && "rounded-bl-[12px] [&::after]:hidden",
                  !isUser && prevSameRole && "rounded-tl-[4px]"
                )}
              >
                {isUser ? (
                  <div className="flex flex-col gap-2">
                    {(m.previewAttachments?.length || m.attachments?.length) ? (
                      <div className="flex flex-wrap gap-1.5">
                        {(m.previewAttachments ?? []).map((att) =>
                          att.kind === "image" && att.previewUrl ? (
                            <img
                              key={att.id}
                              src={att.previewUrl}
                              alt={att.name}
                              className="max-h-36 max-w-full rounded-[var(--radius-sm)] object-cover"
                            />
                          ) : (
                            <span
                              key={att.id}
                              className="inline-flex items-center gap-1 rounded-full bg-accent-foreground/15 px-2 py-0.5 text-[11.5px]"
                            >
                              {att.kind === "image" ? (
                                <ImageSquare className="w-3 h-3" />
                              ) : (
                                <FileText className="w-3 h-3" />
                              )}
                              {att.name}
                            </span>
                          )
                        )}
                        {!m.previewAttachments?.length &&
                          m.attachments?.map((att) => (
                            <span
                              key={`${att.name}-${att.mime}`}
                              className="inline-flex items-center gap-1 rounded-full bg-accent-foreground/15 px-2 py-0.5 text-[11.5px]"
                            >
                              {att.kind === "image" ? (
                                <ImageSquare className="w-3 h-3" />
                              ) : (
                                <FileText className="w-3 h-3" />
                              )}
                              {att.name}
                            </span>
                          ))}
                      </div>
                    ) : null}
                    {m.content}
                  </div>
                ) : isEmpty && isGenerating && isLast ? (
                  <ThinkingIndicator />
                ) : (
                  <MarkdownContent content={m.content} />
                )}
              </div>
            );
            return (
              <div
                key={i}
                className={cn(
                  "flex w-full",
                  isUser ? "justify-end pl-12" : "justify-start pr-12",
                  prevSameRole ? "mt-[2px]" : "mt-1.5"
                )}
              >
                <div className={cn("flex flex-col max-w-[80%] min-w-0", isUser ? "items-end" : "items-start")}>
                  {pipelineLabel && !isUser && (
                    <div className="flex items-center gap-1 mb-1 px-1">
                      <FlowArrow className="w-3 h-3 text-accent" />
                      <span className="text-[11px] font-semibold text-accent uppercase tracking-wide">
                        {pipelineLabel}
                      </span>
                    </div>
                  )}
                  {canShowActions ? (
                    <MessageActions
                      content={m.content}
                      align={isUser ? "end" : "start"}
                      onResend={
                        isUser && !isGenerating
                          ? () => {
                              void send(m.content);
                            }
                          : undefined
                      }
                      onEdit={
                        isUser
                          ? () => {
                              setInput(m.content);
                              inputRef.current?.focus();
                            }
                          : undefined
                      }
                      showRegenerate={!isUser && !isGenerating}
                      onRegenerate={
                        !isUser && !isGenerating
                          ? () => {
                              const history = messages.slice(0, i);
                              if (history[history.length - 1]?.role !== "user") return;
                              void replay(history);
                            }
                          : undefined
                      }
                    >
                      {bubble}
                    </MessageActions>
                  ) : (
                    bubble
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-1.5 pt-2 pb-2 shrink-0 mt-auto">
        {attachError && <p className="text-[12px] text-danger px-0.5">{attachError}</p>}
        {engine === "local" && attachmentsNeedVision(pendingFiles) && (
          <p className="text-[12px] text-muted px-0.5">
            The local engine cannot look at pictures or PDFs. Switch to Cloud so Gemini can see them.
          </p>
        )}

        {engine === "api" && (
          <ModelPicker
            open={modelPickerOpen}
            onClose={() => setModelPickerOpen(false)}
            providers={providerStatus}
            selected={providerChoice}
            onSelect={setProviderChoice}
            lastProviderUsed={lastProviderUsed}
          />
        )}

        <div className="flex items-end">
          <input
            ref={fileInputRef}
            type="file"
            accept={ATTACH_ACCEPT}
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <div
            className={cn(
              "sandbox-composer w-full min-w-0 rounded-[var(--radius-lg)] bg-surface border transition-colors",
              composerFocused || listening ? "border-accent" : "border-border"
            )}
          >
            {listening ? (
              <div className="flex items-center gap-3 px-3 min-h-12">
                <span className="voice-bars" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </span>
                <p className="min-w-0 flex-1 text-[15px] font-medium text-accent truncate" aria-live="polite">
                  {input.trim() || "Listening"}
                </p>
                {isVoiceInputSupported() && (
                  <button
                    type="button"
                    onClick={handleToggleVoice}
                    aria-label="Stop voice input"
                    className="h-11 w-11 flex items-center justify-center rounded-full bg-accent-soft shrink-0"
                  >
                    <Microphone className="w-[18px] h-[18px] text-accent" weight="fill" />
                  </button>
                )}
              </div>
            ) : (
            <div className="flex flex-col">
              {pendingFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-3 pt-2.5">
                  {pendingFiles.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-1.5 pl-1 pr-1 py-1 rounded-[var(--radius-sm)] bg-background border border-border max-w-[180px]"
                    >
                      {att.kind === "image" && att.previewUrl ? (
                        <img src={att.previewUrl} alt="" className="w-8 h-8 rounded-[var(--radius-sm)] object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-accent-soft flex items-center justify-center shrink-0">
                          <FileText className="w-3.5 h-3.5 text-accent" />
                        </div>
                      )}
                      <span className="text-[11.5px] truncate flex-1">{att.name}</span>
                      <button
                        type="button"
                        onClick={() => removePending(att.id)}
                        className="p-1 rounded-full shrink-0"
                        aria-label={`Remove ${att.name}`}
                      >
                        <X className="w-3 h-3 text-muted" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                    void handleSend();
                  }
                }}
                placeholder="Write a prompt…"
                disabled={isGenerating}
                className="block w-full resize-none bg-transparent text-[16px] outline-none disabled:opacity-60 px-3.5 pt-2.5 pb-1 leading-[1.45] overflow-y-auto min-h-10"
              />
              <div className="flex items-center gap-0.5 px-1.5 pb-1.5">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={clear}
                    disabled={isGenerating}
                    className="h-11 w-11 flex items-center justify-center rounded-full disabled:opacity-40 shrink-0"
                    aria-label="Clear chat"
                  >
                    <ArrowCounterClockwise className="w-4 h-4 text-muted" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isGenerating}
                  className="h-11 w-11 flex items-center justify-center rounded-full disabled:opacity-40 shrink-0"
                  aria-label="Attach files"
                >
                  <Paperclip className="w-4 h-4 text-muted" />
                </button>
                {engine === "api" && (
                  <button
                    type="button"
                    onClick={() => setModelPickerOpen((v) => !v)}
                    data-model-picker-trigger
                    className="flex items-center gap-1 h-11 px-2 rounded-[var(--radius-pill)] text-[14px] font-medium text-muted leading-none shrink-0"
                  >
                    {providerChoice === "auto" ? (
                      <MagicWand className="w-3.5 h-3.5 text-muted" />
                    ) : null}
                    {providerChoice === "auto"
                      ? "Auto"
                      : (providerStatus?.find((p) => p.id === providerChoice)?.name ?? providerChoice)}
                    <CaretDown className="w-3 h-3 text-muted-soft" />
                  </button>
                )}
                <span className="flex-1 min-w-2" />
                {isVoiceInputSupported() && (
                  <button
                    type="button"
                    onClick={handleToggleVoice}
                    disabled={isGenerating}
                    aria-label="Voice input"
                    className="h-11 w-11 flex items-center justify-center rounded-full transition-colors disabled:opacity-40 shrink-0"
                  >
                    <Microphone className="w-5 h-5 text-muted" />
                  </button>
                )}
                {isGenerating ? (
                  <button
                    type="button"
                    onClick={stop}
                    className="h-11 w-11 flex items-center justify-center rounded-full bg-foreground shrink-0 active:scale-90 transition-transform"
                    aria-label="Stop generating"
                  >
                    <Stop className="w-4 h-4 text-background" weight="fill" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!canSend}
                    className={cn(
                      "h-11 w-11 flex items-center justify-center rounded-full shrink-0 transition-colors",
                      canSend ? "bg-accent text-accent-foreground" : "bg-transparent text-muted-soft"
                    )}
                    aria-label="Send"
                  >
                    <ArrowUp className="w-5 h-5" weight="bold" />
                  </button>
                )}
              </div>
            </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showHistory && (
          <HistoryPanel
            conversations={conversations}
            activeId={activeConvId}
            onSelect={handleSelectConversation}
            onDelete={handleDeleteConversation}
            onClose={() => setShowHistory(false)}
          />
        )}
      </AnimatePresence>

      {flyingText && (
        <div
          className="fixed z-[60] pointer-events-none rounded-[var(--radius-lg)] bg-accent text-accent-foreground text-[14px] leading-relaxed px-3.5 py-2.5 truncate"
          style={{
            top: flyingText.startTop,
            left: flyingText.startLeft,
            width: flyingText.startWidth,
            animation: "fly-to-chat 0.4s cubic-bezier(0.34, 1.2, 0.64, 1) forwards",
            // Custom properties read by the keyframe below to compute the travel distance.
            ["--fly-distance" as string]: `${flyingText.endTop - flyingText.startTop}px`,
            ["--fly-x" as string]: `${flyingText.endLeft - flyingText.startLeft}px`,
          }}
        >
          {flyingText.text}
        </div>
      )}
    </div>
  );
}

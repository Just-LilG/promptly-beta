"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatAttachment, StoredAttachment } from "@/lib/chat-attachments";
import { toStoredAttachments } from "@/lib/chat-attachments";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  attachments?: StoredAttachment[];
  previewAttachments?: ChatAttachment[];
};

export function useApiTutor(systemPrompt: string, providerId: string = "auto") {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesRef = useRef<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastProviderUsed, setLastProviderUsed] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const providerIdRef = useRef(providerId);

  // Keep both refs in sync with the latest committed values — read from
  // event handlers/async code (like send below) rather than during render.
  useEffect(() => {
    messagesRef.current = messages;
  });
  useEffect(() => {
    providerIdRef.current = providerId;
  });

  const streamReply = useCallback(
    async (
      history: ChatMessage[],
      systemPromptOverride?: string,
      attachments?: ChatAttachment[]
    ): Promise<string> => {
      setIsGenerating(true);
      const withPlaceholder: ChatMessage[] = [...history, { role: "assistant", content: "" }];
      messagesRef.current = withPlaceholder;
      setMessages(withPlaceholder);

      const controller = new AbortController();
      abortRef.current = controller;
      let full = "";

      const apiMessages = history.map((m, idx) => {
        const isLatestUser = idx === history.length - 1 && m.role === "user";
        return {
          role: m.role,
          content: m.content,
          attachments: isLatestUser
            ? attachments?.map((a) => ({
                name: a.name,
                mime: a.mime,
                kind: a.kind,
                text: a.text,
                dataBase64: a.dataBase64,
              }))
            : undefined,
        };
      });

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system: systemPromptOverride ?? systemPrompt,
            messages: apiMessages,
            provider: providerIdRef.current,
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const errBody = await res.json().catch(() => ({ error: "Request failed." }));
          throw new Error(errBody.error ?? "Request failed.");
        }

        setLastProviderUsed(res.headers.get("X-Provider-Used"));

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          const updated: ChatMessage[] = [...history, { role: "assistant", content: full }];
          messagesRef.current = updated;
          setMessages(updated);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          // User-initiated stop — leave whatever was streamed in place, not an error.
        } else {
          full = err instanceof Error ? err.message : "Something went wrong.";
          const updated: ChatMessage[] = [...history, { role: "assistant", content: full }];
          messagesRef.current = updated;
          setMessages(updated);
        }
      } finally {
        setIsGenerating(false);
        abortRef.current = null;
      }

      return full;
    },
    [systemPrompt]
  );

  const send = useCallback(
    async (userText: string, systemPromptOverride?: string, attachments?: ChatAttachment[]): Promise<string> => {
      const userMessage: ChatMessage = {
        role: "user",
        content: userText,
        attachments: toStoredAttachments(attachments),
        previewAttachments: attachments,
      };
      const nextMessages: ChatMessage[] = [...messagesRef.current, userMessage];
      messagesRef.current = nextMessages;
      setMessages(nextMessages);
      return streamReply(nextMessages, systemPromptOverride, attachments);
    },
    [streamReply]
  );

  const replay = useCallback(
    async (history: ChatMessage[], systemPromptOverride?: string) => {
      messagesRef.current = history;
      setMessages(history);
      return streamReply(history, systemPromptOverride);
    },
    [streamReply]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clear = useCallback(() => {
    messagesRef.current = [];
    setMessages([]);
  }, []);
  const loadMessages = useCallback((loaded: ChatMessage[]) => {
    messagesRef.current = loaded;
    setMessages(loaded);
  }, []);

  return { messages, isGenerating, send, replay, clear, stop, loadMessages, lastProviderUsed };
}

"use client";

import { useCallback, useRef, useState } from "react";
import { useModelLoader } from "@/lib/use-model-loader";
import type { ChatAttachment, StoredAttachment } from "@/lib/chat-attachments";
import { flattenAttachmentsToText, toStoredAttachments } from "@/lib/chat-attachments";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  attachments?: StoredAttachment[];
  previewAttachments?: ChatAttachment[];
};

export function useLocalTutor(systemPrompt: string) {
  const { loadState, engineRef, load } = useModelLoader();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const streamReply = useCallback(
    async (
      history: ChatMessage[],
      systemPromptOverride?: string,
      attachments?: ChatAttachment[]
    ): Promise<string> => {
      if (!engineRef.current || loadState.status !== "ready") return "";
      const engine = engineRef.current;
      setIsGenerating(true);
      setMessages([...history, { role: "assistant", content: "" }]);

      let full = "";
      try {
        const chunks = await engine.chat.completions.create({
          messages: [
            { role: "system", content: systemPromptOverride ?? systemPrompt },
            ...history.map((m, idx) => ({
              role: m.role,
              content:
                idx === history.length - 1
                  ? flattenAttachmentsToText(m.content, attachments)
                  : m.content,
            })),
          ],
          stream: true,
          temperature: 0.7,
        });

        for await (const chunk of chunks) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          full += delta;
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: full };
            return copy;
          });
        }
      } catch (err) {
        full =
          "Something went wrong generating a response. " + (err instanceof Error ? err.message : "");
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: full };
          return copy;
        });
      } finally {
        setIsGenerating(false);
      }

      return full;
    },
    [loadState.status, systemPrompt, engineRef]
  );

  const send = useCallback(
    async (userText: string, systemPromptOverride?: string, attachments?: ChatAttachment[]): Promise<string> => {
      const nextMessages: ChatMessage[] = [
        ...messagesRef.current,
        {
          role: "user",
          content: userText,
          attachments: toStoredAttachments(attachments),
          previewAttachments: attachments,
        },
      ];
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
    // WebLLM stops mid-stream via interruptGenerate — the for-await loop above
    // simply ends early once this resolves, leaving whatever streamed so far.
    engineRef.current?.interruptGenerate();
  }, [engineRef]);

  const clear = useCallback(() => {
    messagesRef.current = [];
    setMessages([]);
  }, []);
  const loadMessages = useCallback((loaded: ChatMessage[]) => {
    messagesRef.current = loaded;
    setMessages(loaded);
  }, []);

  return { loadState, messages, isGenerating, load, send, replay, clear, stop, loadMessages };
}

import { pushConversation, pushConversationDelete } from "@/lib/remote-sync";
import { attachmentSummaryLine, type StoredAttachment } from "@/lib/chat-attachments";

const STORAGE_KEY = "promptly:sandbox-conversations";
const MAX_CONVERSATIONS = 30; // cap so storage doesn't grow unbounded

export type StoredMessage = {
  role: "user" | "assistant";
  content: string;
  attachments?: StoredAttachment[];
};

export type Conversation = {
  id: string;
  title: string; // derived from the first user message
  messages: StoredMessage[];
  updatedAt: string;
};

function readAll(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Conversation[]) : [];
  } catch {
    return [];
  }
}

function writeAll(conversations: Conversation[]) {
  if (typeof window === "undefined") return;
  try {
    // Keep only the most recent N, sorted newest-first, so storage doesn't grow forever.
    const trimmed = [...conversations]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, MAX_CONVERSATIONS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // storage full or unavailable — history just won't persist this session
  }
}

function deriveTitle(messages: StoredMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New conversation";
  const text = firstUser.content.trim().replace(/\s+/g, " ");
  if (text) return text.length > 48 ? text.slice(0, 48) + "…" : text;
  const attached = attachmentSummaryLine(firstUser.attachments);
  return attached || "New conversation";
}

export function listConversations(): Conversation[] {
  return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getConversation(id: string): Conversation | undefined {
  return readAll().find((c) => c.id === id);
}

// Saves (creates or updates) a conversation. Returns the id, generating one
// if this is the first save for a new conversation.
export function saveConversation(
  id: string | null,
  messages: (StoredMessage & { previewAttachments?: unknown })[]
): string {
  if (messages.length === 0) return id ?? "";
  const persistable: StoredMessage[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
    ...(m.attachments?.length ? { attachments: m.attachments } : {}),
  }));

  const all = readAll();
  const resolvedId = id ?? `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const existingIndex = all.findIndex((c) => c.id === resolvedId);

  const conversation: Conversation = {
    id: resolvedId,
    title: deriveTitle(persistable),
    messages: persistable,
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    all[existingIndex] = conversation;
  } else {
    all.push(conversation);
  }

  writeAll(all);
  pushConversation(conversation);
  return resolvedId;
}

export function deleteConversation(id: string) {
  const all = readAll();
  writeAll(all.filter((c) => c.id !== id));
  pushConversationDelete(id);
}

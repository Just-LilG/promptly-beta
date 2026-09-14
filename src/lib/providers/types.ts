export type ProviderAttachment = {
  name: string;
  mime: string;
  kind: "image" | "pdf" | "text";
  text?: string;
  dataBase64?: string;
};

export type ProviderMessage = {
  role: "user" | "assistant";
  content: string;
  attachments?: ProviderAttachment[];
};

export type ProviderId = "gemini" | "groq";

export type ProviderKeyStatus = {
  configured: boolean;
  // How many distinct keys are set for this provider (0, 1, or 2) — used to
  // decide whether Auto has a fallback key to reach for on a 429.
  keyCount: number;
};

// A provider adapter turns (system prompt, message history, one API key)
// into a streamed sequence of text chunks. Every provider — however
// different its native request shape — is wrapped to satisfy exactly this
// signature, so the route and the Auto-rotation logic never need to know
// which service they're actually talking to.
export type StreamChatFn = (args: {
  apiKey: string;
  system: string;
  messages: ProviderMessage[];
  signal?: AbortSignal;
}) => AsyncGenerator<string, void, unknown>;

export type Provider = {
  id: ProviderId;
  name: string;
  // Env var names checked, in order, for this provider's keys — supports up
  // to two accounts per provider so Auto can rotate past a rate limit.
  envKeys: [string, string];
  streamChat: StreamChatFn;
};

// Thrown by a provider adapter specifically for rate-limit responses (HTTP
// 429, or a provider-specific equivalent), so the Auto-rotation logic in the
// route can distinguish "try the next key/provider" from "a real failure —
// stop and show the user an error."
export class RateLimitError extends Error {
  constructor(message = "Rate limited") {
    super(message);
    this.name = "RateLimitError";
  }
}

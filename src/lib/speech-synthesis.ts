// Thin wrapper around the browser's built-in SpeechSynthesis API — no
// server, no API key, works fully offline. Support varies by browser, so
// every call site should treat this as best-effort and check isSpeechSupported first.

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export type SpeakHandlers = {
  onEnd?: () => void;
  onError?: () => void;
};

// Speaks the given text, cancelling any speech already in progress first —
// only one read-aloud should ever be active at a time in this app.
export function speak(text: string, handlers: SpeakHandlers = {}): void {
  if (!isSpeechSupported() || !text.trim()) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(stripMarkdownForSpeech(text));
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.onend = () => handlers.onEnd?.();
  utterance.onerror = () => handlers.onError?.();

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
}

export function isSpeaking(): boolean {
  return isSpeechSupported() && window.speechSynthesis.speaking;
}

// Strip the most common markdown noise (bold/italic markers, code fences,
// bullet dashes, headers) so read-aloud doesn't voice literal asterisks and
// hashes — a light touch, not a full markdown parser.
function stripMarkdownForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " code block ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

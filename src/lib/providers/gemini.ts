import { GoogleGenAI } from "@google/genai";
import { RateLimitError, type Provider } from "@/lib/providers/types";

const MODEL = "gemini-3.6-flash";

const streamChat: Provider["streamChat"] = async function* ({ apiKey, system, messages }) {
  const ai = new GoogleGenAI({ apiKey });

  // Gemini uses "model" instead of "assistant" for the AI's turns, and expects
  // each message as { role, parts: [...] } rather than { role, content }.
  const contents = messages.map((m) => {
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
    if ((m.content ?? "").trim()) parts.push({ text: m.content });
    for (const att of m.attachments ?? []) {
      if (att.kind === "text" && att.text) {
        parts.push({ text: `\n\n--- File: ${att.name} ---\n${att.text}` });
      } else if (att.dataBase64 && (att.kind === "image" || att.kind === "pdf")) {
        parts.push({ inlineData: { mimeType: att.mime, data: att.dataBase64 } });
      }
    }
    if (parts.length === 0) parts.push({ text: "" });
    return {
      role: m.role === "assistant" ? "model" : "user",
      parts,
    };
  });

  let stream;
  try {
    stream = await ai.models.generateContentStream({
      model: MODEL,
      contents,
      config: { systemInstruction: system },
    });
  } catch (err) {
    if (isRateLimitError(err)) throw new RateLimitError();
    throw err;
  }

  try {
    for await (const chunk of stream) {
      if (chunk.text) yield chunk.text;
    }
  } catch (err) {
    if (isRateLimitError(err)) throw new RateLimitError();
    throw err;
  }
};

function isRateLimitError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes("429") || message.toLowerCase().includes("rate limit") || message.toLowerCase().includes("quota");
}

export const geminiProvider: Provider = {
  id: "gemini",
  name: "Gemini",
  envKeys: ["GEMINI_API_KEY", "GEMINI_API_KEY_2"],
  streamChat,
};

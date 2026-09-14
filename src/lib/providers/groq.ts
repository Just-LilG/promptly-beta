import { RateLimitError, type Provider } from "@/lib/providers/types";

// Groq's current free-tier production model. llama-3.3-70b-versatile and
// llama-3.1-8b-instant were moved to Enterprise-only ("Contact Sales")
// pricing, so they 400 on a standard free-tier key — gpt-oss-20b is Groq's
// documented free-tier replacement: fast (~1000 t/sec) and openly billed
// per-token rather than requiring a sales contract.
const MODEL = "openai/gpt-oss-20b";

function flattenMessage(m: { role: "user" | "assistant"; content: string; attachments?: { name: string; kind: string; text?: string }[] }) {
  if (!m.attachments?.length) return { role: m.role, content: m.content };
  const extras = m.attachments.map((att) => {
    if (att.kind === "text" && att.text) return `\n\n--- File: ${att.name} ---\n${att.text}`;
    if (att.kind === "image") return `\n\n[Attached image: ${att.name}. This model cannot view images.]`;
    if (att.kind === "pdf") return `\n\n[Attached PDF: ${att.name}. This model cannot read PDFs.]`;
    return `\n\n[Attached file: ${att.name}]`;
  });
  return { role: m.role, content: `${m.content}${extras.join("")}`.trim() };
}

const streamChat: Provider["streamChat"] = async function* ({ apiKey, system, messages, signal }) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      temperature: 0.7,
      messages: [{ role: "system", content: system }, ...messages.map(flattenMessage)],
    }),
    signal,
  });

  if (res.status === 429) throw new RateLimitError();
  if (!res.ok || !res.body) {
    const errBody = await res.json().catch(() => null);
    throw new Error(errBody?.error?.message ?? `Groq request failed (${res.status}).`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Groq streams standard OpenAI-style SSE: lines starting with "data: ",
    // each a JSON chunk, terminated by a literal "data: [DONE]" line. Buffer
    // until a full line arrives since chunk boundaries don't align with lines.
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return;

      try {
        const parsed = JSON.parse(payload);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        // Malformed or partial JSON line — skip rather than crash the stream.
      }
    }
  }
};

export const groqProvider: Provider = {
  id: "groq",
  name: "Groq",
  envKeys: ["GROQ_API_KEY", "GROQ_API_KEY_2"],
  streamChat,
};

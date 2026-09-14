import { NextRequest } from "next/server";
import { PROVIDERS, getConfiguredKeys, getProvider } from "@/lib/providers/registry";
import { RateLimitError, type ProviderMessage } from "@/lib/providers/types";

export const runtime = "nodejs";

type RequestBody = {
  system: string;
  messages: ProviderMessage[];
  // "auto" (default when omitted) rotates across every configured provider
  // and key until one responds; a specific id pins the request to just that
  // provider (falling back only across that provider's own two keys, not to
  // other providers) — e.g. when the user picks "Groq" explicitly rather
  // than leaving it on Auto.
  provider?: "auto" | string;
};

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const { system, messages, provider: requestedProvider = "auto" } = body;
  if (!system || !Array.isArray(messages) || messages.length === 0) {
    return jsonError("Missing system prompt or messages.", 400);
  }

  const hasVisual = messages.some((m) =>
    m.attachments?.some((a) => a.kind === "image" || a.kind === "pdf")
  );

  // Build the ordered list of (provider, apiKey) attempts to make. Auto
  // walks every provider in registry order, trying each configured key in
  // turn; a pinned provider only walks that one provider's keys.
  // Pictures and PDFs are visible to Gemini, not to Groq's current text model,
  // so Auto puts Gemini first when those files are attached.
  let providersToTry =
    requestedProvider === "auto"
      ? [...PROVIDERS]
      : PROVIDERS.filter((p) => p.id === requestedProvider);
  if (requestedProvider === "auto" && hasVisual) {
    providersToTry.sort((a, b) => Number(b.id === "gemini") - Number(a.id === "gemini"));
  }

  if (providersToTry.length === 0) {
    return jsonError(`Unknown provider "${requestedProvider}".`, 400);
  }

  const attempts: { provider: (typeof PROVIDERS)[number]; apiKey: string }[] = [];
  for (const provider of providersToTry) {
    for (const apiKey of getConfiguredKeys(provider)) {
      attempts.push({ provider, apiKey });
    }
  }

  if (attempts.length === 0) {
    const label =
      requestedProvider === "auto"
        ? "any AI provider"
        : (getProvider(requestedProvider as (typeof PROVIDERS)[number]["id"])?.name ?? requestedProvider);
    return jsonError(
      `${label} isn't configured yet. No API key is set on the server. Add one in your environment variables, or use the Local engine instead.`,
      503
    );
  }

  const encoder = new TextEncoder();
  let lastError: unknown = null;

  for (const { provider, apiKey } of attempts) {
    try {
      // Prove the connection works with a first chunk before committing to
      // this attempt's stream — if the very first call throws (including a
      // 429), we can still fall back to the next key/provider. Once a first
      // chunk has streamed to the client, though, we're committed: swapping
      // providers mid-stream would produce a garbled response, so any error
      // after that point is streamed as an inline error note instead.
      const generator = provider.streamChat({ apiKey, system, messages, signal: req.signal });
      const first = await generator.next();

      const readable = new ReadableStream({
        async start(controller) {
          try {
            if (!first.done && first.value) controller.enqueue(encoder.encode(first.value));
            for await (const chunk of generator) {
              controller.enqueue(encoder.encode(chunk));
            }
          } catch (err) {
            controller.enqueue(
              encoder.encode(
                "\n\n[Error while streaming: " + (err instanceof Error ? err.message : "unknown") + "]"
              )
            );
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          // Lets the client show which provider actually answered when on Auto.
          "X-Provider-Used": provider.id,
        },
      });
    } catch (err) {
      lastError = err;
      if (err instanceof RateLimitError) {
        // Rate limited on this key — try the next key/provider in the list.
        continue;
      }
      // A non-rate-limit error (bad key, provider outage, etc.) on a pinned
      // provider request should surface immediately rather than silently
      // trying other keys of the same provider that are likely to fail the
      // same way. On Auto, still worth trying the next provider — a
      // different service failing for an unrelated reason doesn't mean the
      // rest are down too.
      if (requestedProvider !== "auto") break;
    }
  }

  const message =
    lastError instanceof RateLimitError
      ? "All configured AI providers are currently rate limited. Try again in a moment."
      : lastError instanceof Error
        ? lastError.message
        : "Every configured AI provider failed to respond.";
  return jsonError(message, 502);
}

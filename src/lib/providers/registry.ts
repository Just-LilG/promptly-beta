import { geminiProvider } from "@/lib/providers/gemini";
import { groqProvider } from "@/lib/providers/groq";
import type { Provider, ProviderId } from "@/lib/providers/types";

// Order here is the Auto fallback order: Auto tries providers top to bottom,
// and within a provider tries its first key then its second, moving to the
// next provider only once both of a provider's keys have been tried (or it
// has none configured). Groq listed first — it's the fastest and most
// generous free tier of the two currently wired in.
export const PROVIDERS: Provider[] = [groqProvider, geminiProvider];

export function getProvider(id: ProviderId): Provider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

// Reads which keys are actually set in the server environment for a
// provider — never returns the key values themselves, just how many exist,
// so this is safe to expose to the client for populating the model picker.
export function getConfiguredKeys(provider: Provider): string[] {
  return provider.envKeys.map((envVar) => process.env[envVar]).filter((v): v is string => Boolean(v));
}

import { PROVIDERS, getConfiguredKeys } from "@/lib/providers/registry";

export const runtime = "nodejs";

// Reports which providers have at least one key configured, and how many —
// never the key values themselves. The model picker uses this to show only
// real, usable options, and Auto uses the key count to know whether a
// second key exists to fall back to on a rate limit.
export async function GET() {
  const status = PROVIDERS.map((provider) => {
    const keys = getConfiguredKeys(provider);
    return {
      id: provider.id,
      name: provider.name,
      configured: keys.length > 0,
      keyCount: keys.length,
    };
  });

  return Response.json({ providers: status });
}

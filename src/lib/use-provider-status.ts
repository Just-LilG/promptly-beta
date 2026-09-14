"use client";

import { useEffect, useState } from "react";

export type ProviderStatus = {
  id: string;
  name: string;
  configured: boolean;
  keyCount: number;
};

export function useProviderStatus() {
  const [providers, setProviders] = useState<ProviderStatus[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/providers")
      .then((res) => res.json())
      .then((data: { providers: ProviderStatus[] }) => {
        if (!cancelled) setProviders(data.providers);
      })
      .catch(() => {
        if (!cancelled) setProviders([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return providers;
}

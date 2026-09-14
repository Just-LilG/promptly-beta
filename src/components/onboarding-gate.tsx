"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasCompletedOnboarding } from "@/lib/onboarding";
import { hydrateFromServer } from "@/lib/remote-sync";
import { HomeSkeleton } from "@/components/skeleton";

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void hydrateFromServer().then(() => {
      if (cancelled) return;
      if (hasCompletedOnboarding()) {
        setShouldRender(true);
      } else {
        router.replace("/onboarding");
      }
      setChecked(true);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  // Avoid a flash of the dashboard before we know whether to redirect.
  if (!checked || !shouldRender) return <HomeSkeleton />;

  return <>{children}</>;
}

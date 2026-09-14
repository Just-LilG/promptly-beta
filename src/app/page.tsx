import { OnboardingGate } from "@/components/onboarding-gate";
import { HomeClient } from "@/components/home-client";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <OnboardingGate>
      <HomeClient />
    </OnboardingGate>
  );
}

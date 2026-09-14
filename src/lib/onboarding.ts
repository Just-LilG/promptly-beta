import { pushOnboarding } from "@/lib/remote-sync";

const STORAGE_KEY = "promptly:onboarding-profile";

export type SkillLevel = "beginner" | "some-experience" | "experienced";

export type OnboardingProfile = {
  skillLevel: SkillLevel;
  primaryInterest: string; // track slug
  diagnosticScore: number | null;
  completedAt: string;
};

export function getOnboardingProfile(): OnboardingProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OnboardingProfile) : null;
  } catch {
    return null;
  }
}

export function saveOnboardingProfile(profile: Omit<OnboardingProfile, "completedAt">) {
  if (typeof window === "undefined") return;
  try {
    const full: OnboardingProfile = { ...profile, completedAt: new Date().toISOString() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
    pushOnboarding(full);
  } catch {
    // storage unavailable — onboarding will just show again next visit, non-critical
  }
}

export function hasCompletedOnboarding(): boolean {
  return getOnboardingProfile() !== null;
}

export function skipOnboarding() {
  // Record a minimal profile so we don't keep prompting, without pretending
  // we have real skill/interest data — used when the user explicitly skips.
  saveOnboardingProfile({
    skillLevel: "some-experience",
    primaryInterest: "everyday",
    diagnosticScore: null,
  });
}

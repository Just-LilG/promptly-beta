const GUEST_KEY = "promptly:guest-handle";

function randomGuestHandle(): string {
  // user12-style labels: two digits, sticky in this browser until they sign in.
  const n = 10 + Math.floor(Math.random() * 90);
  return `user${n}`;
}

export function getGuestHandle(): string {
  if (typeof window === "undefined") return "there";
  try {
    const existing = window.localStorage.getItem(GUEST_KEY);
    if (existing && /^user\d{2}$/.test(existing)) return existing;
    const handle = randomGuestHandle();
    window.localStorage.setItem(GUEST_KEY, handle);
    return handle;
  } catch {
    return "there";
  }
}

export function firstWord(value: string | null | undefined): string | null {
  if (!value) return null;
  const word = value.trim().split(/\s+/)[0];
  return word || null;
}

export function emailHandle(email: string | null | undefined): string | null {
  if (!email) return null;
  const local = email.split("@")[0]?.trim();
  return local || null;
}

export function initialsFrom(name: string): string {
  if (/^user\d{2}$/i.test(name.trim())) return name.trim().slice(-2);
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  const initials = (a + b).toUpperCase();
  return initials || name.slice(0, 2).toUpperCase() || "?";
}

export function timeOfDayGreeting(date = new Date()): "Good morning" | "Good afternoon" | "Good evening" {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

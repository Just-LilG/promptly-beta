import { getDisplayStreak, isStreakAtRisk } from "@/lib/streaks";

const PREFS_KEY = "promptly:notify-prefs";
const INBOX_KEY = "promptly:notify-inbox";
const PUSHED_KEY = "promptly:notify-pushed";
export const INBOX_EVENT = "promptly:inbox";

export type NotifyKind = "welcome" | "streak" | "keep" | "test";

export type InboxItem = {
  id: string;
  kind: NotifyKind;
  href: string;
  createdAt: number;
  read: boolean;
  vars?: Record<string, string | number>;
};

export type NotifyPrefs = {
  alerts: boolean;
  streakReminders: boolean;
};

const DEFAULT_PREFS: NotifyPrefs = {
  alerts: false,
  streakReminders: true,
};

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

export function isStandaloneApp(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isLikelyIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? ({ ...fallback, ...(JSON.parse(raw) as T) } as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getNotifyPrefs(): NotifyPrefs {
  return readJson(PREFS_KEY, DEFAULT_PREFS);
}

export function setNotifyPrefs(next: Partial<NotifyPrefs>): NotifyPrefs {
  const merged = { ...getNotifyPrefs(), ...next };
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(merged));
  } catch {
    // storage blocked
  }
  bumpInbox();
  return merged;
}

export function getInbox(): InboxItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(INBOX_KEY);
    const parsed = raw ? (JSON.parse(raw) as InboxItem[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeInbox(items: InboxItem[]) {
  try {
    window.localStorage.setItem(INBOX_KEY, JSON.stringify(items.slice(0, 40)));
  } catch {
    // storage blocked
  }
  bumpInbox();
}

export function unreadCount(): number {
  return getInbox().filter((item) => !item.read).length;
}

function upsert(item: InboxItem) {
  const items = getInbox().filter((row) => row.id !== item.id);
  writeInbox([item, ...items]);
}

function bumpInbox() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(INBOX_EVENT));
}

export function markAllRead() {
  writeInbox(getInbox().map((item) => ({ ...item, read: true })));
}

export function markItemRead(id: string) {
  writeInbox(getInbox().map((item) => (item.id === id ? { ...item, read: true } : item)));
}

const DISMISS_KEY = "promptly:notify-dismissed";

function dismissedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function rememberDismissed(ids: string[]) {
  const next = [...new Set([...dismissedIds(), ...ids])].slice(-80);
  try {
    window.localStorage.setItem(DISMISS_KEY, JSON.stringify(next));
  } catch {
    // storage blocked
  }
}

export function clearInbox() {
  rememberDismissed(getInbox().map((item) => item.id));
  writeInbox([]);
}

/** Fill the in-app list from streak / first-run state. Safe to call often. */
export function refreshInbox() {
  if (typeof window === "undefined") return;
  const streak = getDisplayStreak();
  const now = Date.now();

  if (!getInbox().some((item) => item.kind === "welcome") && !dismissedIds().includes("welcome")) {
    upsert({
      id: "welcome",
      kind: "welcome",
      href: "/",
      createdAt: now,
      read: false,
    });
  }

  const skipped = new Set(dismissedIds());
  const streakId = `streak:${todayKey()}`;
  if (
    isStreakAtRisk(streak) &&
    getNotifyPrefs().streakReminders &&
    !getInbox().some((item) => item.id === streakId) &&
    !skipped.has(streakId)
  ) {
    upsert({
      id: streakId,
      kind: "streak",
      href: "/",
      createdAt: now,
      read: false,
      vars: { n: streak.current },
    });
  }

  if (
    streak.totalActiveDays === 0 &&
    streak.current === 0 &&
    !getInbox().some((item) => item.kind === "keep") &&
    !skipped.has("keep")
  ) {
    upsert({
      id: "keep",
      kind: "keep",
      href: "/",
      createdAt: now,
      read: false,
    });
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!notificationsSupported()) return "unsupported";
  const result = await Notification.requestPermission();
  if (result === "granted") {
    setNotifyPrefs({ alerts: true });
  }
  return result;
}

function pushedToday(kind: string): boolean {
  try {
    return window.localStorage.getItem(PUSHED_KEY) === `${todayKey()}:${kind}`;
  } catch {
    return false;
  }
}

function markPushed(kind: string) {
  try {
    window.localStorage.setItem(PUSHED_KEY, `${todayKey()}:${kind}`);
  } catch {
    // storage blocked
  }
}

export async function showPhoneAlert(options: {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}): Promise<boolean> {
  if (!notificationsSupported()) return false;
  if (Notification.permission !== "granted") return false;
  if (!getNotifyPrefs().alerts) return false;

  const payload = {
    body: options.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-96.png",
    tag: options.tag ?? "promptly",
    data: { url: options.url ?? "/notifications" },
  };

  try {
    const ready = "serviceWorker" in navigator ? await navigator.serviceWorker.ready : null;
    if (ready) {
      await ready.showNotification(options.title, payload);
      return true;
    }
    new Notification(options.title, payload);
    return true;
  } catch {
    return false;
  }
}

export async function sendTestAlert(title: string, body: string): Promise<boolean> {
  upsert({
    id: "test",
    kind: "test",
    href: "/notifications",
    createdAt: Date.now(),
    read: false,
  });
  return showPhoneAlert({ title, body, url: "/notifications", tag: "promptly-test" });
}

/** If the streak is at risk and alerts are on, ping the phone once today. */
export async function maybePushStreakReminder(title: string, body: string) {
  const prefs = getNotifyPrefs();
  if (!prefs.alerts || !prefs.streakReminders) return;
  if (getNotificationPermission() !== "granted") return;
  const streak = getDisplayStreak();
  if (!isStreakAtRisk(streak)) return;
  if (pushedToday("streak")) return;
  const ok = await showPhoneAlert({
    title,
    body,
    url: "/notifications",
    tag: "promptly-streak",
  });
  if (ok) markPushed("streak");
}

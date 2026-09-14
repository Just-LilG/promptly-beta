export const DICEBEAR_VERSION = "10.x";
export const DICEBEAR_DEFAULT_STYLE = "lorelei";

export const DICEBEAR_STYLES = [
  { id: "lorelei", label: "Lorelei" },
  { id: "adventurer", label: "Adventurer" },
  { id: "notionists", label: "Notionists" },
  { id: "avataaars", label: "Avataaars" },
  { id: "pixel-art", label: "Pixel" },
  { id: "thumbs", label: "Thumbs" },
  { id: "bottts", label: "Robots" },
  { id: "fun-emoji", label: "Emoji" },
] as const;

export type DicebearStyleId = (typeof DICEBEAR_STYLES)[number]["id"];

export type AvatarChoice =
  | { kind: "dicebear"; style: string; seed: string }
  | { kind: "upload"; dataUrl: string };

const STORAGE_KEY = "promptly:avatar";
export const AVATAR_CHANGE_EVENT = "promptly:avatar";

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
const MAX_DATA_URL_CHARS = 120_000;
const AVATAR_EDGE = 256;

export function dicebearUrl(style: string, seed: string): string {
  const safeStyle = DICEBEAR_STYLES.some((s) => s.id === style) ? style : DICEBEAR_DEFAULT_STYLE;
  const params = new URLSearchParams({ seed });
  return `https://api.dicebear.com/${DICEBEAR_VERSION}/${safeStyle}/svg?${params.toString()}`;
}

export function readAvatarChoice(): AvatarChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AvatarChoice;
    if (parsed.kind === "dicebear" && parsed.style && parsed.seed) return parsed;
    if (parsed.kind === "upload" && parsed.dataUrl?.startsWith("data:image/")) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function writeAvatarChoice(choice: AvatarChoice) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(choice));
  } catch {
    // storage full — the picture just won't stick on this device
  }
  window.dispatchEvent(new Event(AVATAR_CHANGE_EVENT));
}

export function resolveAvatarSrc(
  choice: AvatarChoice | null,
  fallbackSeed: string,
  sessionImage?: string | null
): string {
  if (choice?.kind === "upload") return choice.dataUrl;
  if (choice?.kind === "dicebear") return dicebearUrl(choice.style, choice.seed);
  if (sessionImage) return sessionImage;
  return dicebearUrl(DICEBEAR_DEFAULT_STYLE, fallbackSeed || "promptly");
}

export function randomAvatarSeed(): string {
  return `seed_${Math.random().toString(36).slice(2, 10)}`;
}

export async function fileToAvatarDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Pick a picture file, like a photo or PNG.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("That picture is too large. Try one under 2 MB.");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, AVATAR_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read that picture.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = 0.82;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length > MAX_DATA_URL_CHARS && quality > 0.45) {
    quality -= 0.1;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  if (dataUrl.length > MAX_DATA_URL_CHARS) {
    throw new Error("That picture is still too detailed. Try a simpler photo.");
  }
  return dataUrl;
}

export function storedImageFromChoice(choice: AvatarChoice): string {
  return choice.kind === "upload" ? choice.dataUrl : dicebearUrl(choice.style, choice.seed);
}

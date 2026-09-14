export const MAX_ATTACHMENTS = 4;
export const MAX_FILE_BYTES = 3 * 1024 * 1024;
export const MAX_TEXT_CHARS = 80_000;
export const IMAGE_MAX_EDGE = 1280;

export const ATTACH_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,application/pdf,text/plain,text/markdown,text/csv,application/json,.txt,.md,.csv,.json,.pdf";

export type AttachmentKind = "image" | "pdf" | "text";

export type ChatAttachment = {
  id: string;
  name: string;
  mime: string;
  kind: AttachmentKind;
  text?: string;
  dataBase64?: string;
  previewUrl?: string;
};

export type StoredAttachment = {
  name: string;
  mime: string;
  kind: AttachmentKind;
};

const TEXT_MIMES = new Set([
  "text/plain",
  "text/markdown",
  "text/csv",
  "text/html",
  "application/json",
  "application/xml",
  "text/xml",
]);

const IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

function extOf(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

export function kindForFile(file: File): AttachmentKind | null {
  const mime = file.type;
  const ext = extOf(file.name);
  if (IMAGE_MIMES.has(mime) || [".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic", ".heif"].includes(ext)) {
    return "image";
  }
  if (mime === "application/pdf" || ext === ".pdf") return "pdf";
  if (TEXT_MIMES.has(mime) || [".txt", ".md", ".csv", ".json", ".xml", ".html"].includes(ext)) {
    return "text";
  }
  return null;
}

function newId() {
  return `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function readAsArrayBuffer(file: Blob) {
  return file.arrayBuffer();
}

async function compressImage(file: File): Promise<{ mime: string; dataBase64: string; previewUrl: string }> {
  // Animated GIFs and already-small images travel as-is so we don't flatten them.
  if (file.type === "image/gif" || file.size < 400_000) {
    const buf = new Uint8Array(await readAsArrayBuffer(file));
    const dataBase64 = bytesToBase64(buf);
    const previewUrl = URL.createObjectURL(file);
    return { mime: file.type || "image/gif", dataBase64, previewUrl };
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, IMAGE_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare this image.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not compress this image."))),
      "image/jpeg",
      0.82
    );
  });
  const buf = new Uint8Array(await blob.arrayBuffer());
  return {
    mime: "image/jpeg",
    dataBase64: bytesToBase64(buf),
    previewUrl: URL.createObjectURL(blob),
  };
}

export async function fileToAttachment(file: File): Promise<ChatAttachment> {
  const kind = kindForFile(file);
  if (!kind) {
    throw new Error(`"${file.name}" isn't a type we can send yet. Try an image, PDF, or a text file.`);
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`"${file.name}" is too large. Keep each file under 3 MB.`);
  }

  const id = newId();
  const mime = file.type || (kind === "pdf" ? "application/pdf" : kind === "image" ? "image/jpeg" : "text/plain");

  if (kind === "text") {
    const text = (await file.text()).slice(0, MAX_TEXT_CHARS);
    return { id, name: file.name, mime, kind, text };
  }

  if (kind === "image") {
    try {
      const compressed = await compressImage(file);
      return { id, name: file.name, mime: compressed.mime, kind, dataBase64: compressed.dataBase64, previewUrl: compressed.previewUrl };
    } catch {
      const buf = new Uint8Array(await readAsArrayBuffer(file));
      return {
        id,
        name: file.name,
        mime,
        kind,
        dataBase64: bytesToBase64(buf),
        previewUrl: URL.createObjectURL(file),
      };
    }
  }

  const buf = new Uint8Array(await readAsArrayBuffer(file));
  return { id, name: file.name, mime: "application/pdf", kind, dataBase64: bytesToBase64(buf) };
}

export function revokeAttachment(att: ChatAttachment) {
  if (att.previewUrl) URL.revokeObjectURL(att.previewUrl);
}

export function attachmentsNeedVision(attachments: ChatAttachment[] | undefined) {
  return Boolean(attachments?.some((a) => a.kind === "image" || a.kind === "pdf"));
}

export function flattenAttachmentsToText(content: string, attachments: ChatAttachment[] | undefined) {
  if (!attachments?.length) return content;
  const blocks = attachments.map((a) => {
    if (a.kind === "text" && a.text) {
      return `\n\n--- File: ${a.name} ---\n${a.text}`;
    }
    if (a.kind === "image") {
      return `\n\n[Attached image: ${a.name}. This engine cannot look at pictures.]`;
    }
    if (a.kind === "pdf") {
      return `\n\n[Attached PDF: ${a.name}. This engine cannot read PDFs.]`;
    }
    return `\n\n[Attached file: ${a.name}]`;
  });
  return `${content}${blocks.join("")}`.trim();
}

export function attachmentSummaryLine(attachments: StoredAttachment[] | ChatAttachment[] | undefined) {
  if (!attachments?.length) return "";
  return `[Attached: ${attachments.map((a) => a.name).join(", ")}]`;
}

export function toStoredAttachments(attachments: ChatAttachment[] | undefined): StoredAttachment[] | undefined {
  if (!attachments?.length) return undefined;
  return attachments.map((a) => ({ name: a.name, mime: a.mime, kind: a.kind }));
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Shuffle, UploadSimple } from "@/icons";
import { cn } from "@/lib/cn";
import {
  DICEBEAR_DEFAULT_STYLE,
  DICEBEAR_STYLES,
  dicebearUrl,
  fileToAvatarDataUrl,
  randomAvatarSeed,
  readAvatarChoice,
  storedImageFromChoice,
  writeAvatarChoice,
  type AvatarChoice,
} from "@/lib/avatar";
import { emailHandle, getGuestHandle } from "@/lib/display-name";
import { UserAvatar } from "@/components/user-avatar";

async function persistAvatar(
  image: string,
  signedIn: boolean,
  update: ((data: { image: string }) => Promise<unknown>) | undefined
) {
  try {
    await fetch("/api/account/avatar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image }),
    });
    if (signedIn) await update?.({ image });
  } catch {
    // local picture still saved; server copy is best-effort
  }
}

export function AvatarPicker() {
  const { data: session, status, update } = useSession();
  const fileRef = useRef<HTMLInputElement>(null);
  const [seed, setSeed] = useState("");
  const [style, setStyle] = useState(DICEBEAR_DEFAULT_STYLE);
  const [usingUpload, setUsingUpload] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fallbackSeed = session?.user?.id || emailHandle(session?.user?.email) || "";

  useEffect(() => {
    const existing = readAvatarChoice();
    if (existing?.kind === "dicebear") {
      setStyle(existing.style);
      setSeed(existing.seed);
      setUsingUpload(false);
      return;
    }
    if (existing?.kind === "upload") {
      setUsingUpload(true);
    }
    setSeed(fallbackSeed || getGuestHandle());
  }, [fallbackSeed]);

  const save = async (choice: AvatarChoice) => {
    writeAvatarChoice(choice);
    await persistAvatar(storedImageFromChoice(choice), status === "authenticated", update);
  };

  const pickStyle = (nextStyle: string) => {
    setStyle(nextStyle);
    const nextSeed = seed || getGuestHandle();
    setSeed(nextSeed);
    setUsingUpload(false);
    void save({ kind: "dicebear", style: nextStyle, seed: nextSeed });
  };

  const shuffle = () => {
    const nextSeed = randomAvatarSeed();
    setSeed(nextSeed);
    setUsingUpload(false);
    void save({ kind: "dicebear", style, seed: nextSeed });
  };

  const onUpload = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      await save({ kind: "upload", dataUrl });
      setUsingUpload(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not use that picture.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full overflow-hidden border border-border shrink-0 bg-accent-soft">
          <UserAvatar className="w-full h-full" />
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-medium">Profile picture</p>
          <p className="text-[12.5px] text-muted mt-0.5">
            Pick a look, shuffle it, or upload your own photo.
          </p>
          <div className="flex flex-wrap gap-2 mt-2.5">
            <button
              type="button"
              onClick={shuffle}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-pill)] bg-surface border border-border text-[12.5px] font-medium active:scale-95"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Shuffle
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-pill)] bg-surface border border-border text-[12.5px] font-medium active:scale-95 disabled:opacity-50"
            >
              <UploadSimple className="w-3.5 h-3.5" />
              {busy ? "Working..." : "Upload"}
            </button>
          </div>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => void onUpload(e.target.files?.[0])}
      />

      {error && <p className="text-[12.5px] text-danger mt-2">{error}</p>}

      <div className="grid grid-cols-4 gap-2 mt-4">
        {DICEBEAR_STYLES.map((item) => {
          const active = !usingUpload && style === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => pickStyle(item.id)}
              className={cn(
                "rounded-[var(--radius-sm)] border p-1.5 active:scale-95 transition-transform",
                active ? "border-accent" : "border-border"
              )}
              aria-label={item.label}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dicebearUrl(item.id, seed || "promptly")}
                alt=""
                className="w-full aspect-square rounded-[var(--radius-sm)] bg-background"
              />
              <span className="block text-[10.5px] text-muted mt-1 truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-soft mt-3">
        Illustrated looks come from DiceBear. Shuffle changes the character. Upload uses your own photo.
      </p>
    </div>
  );
}

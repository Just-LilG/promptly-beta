"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const missing = !email || !token;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/account/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Could not reset that password.");
        return;
      }
      router.push("/login");
    } catch {
      setError("Could not reset that password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 pt-16 pb-8 min-h-dvh flex flex-col">
      <div className="flex flex-col items-center mb-8">
        <BrandMark size={48} className="w-12 h-12 rounded-[var(--radius-md)] mb-4" alt="Promptly" />
        <h1 className="text-[22px] font-semibold tracking-tight">New password</h1>
        <p className="text-muted text-[13.5px] mt-1 text-center">
          Choose a password of at least 8 characters.
        </p>
      </div>

      {missing ? (
        <p className="text-[14px] text-muted text-center">
          This reset link is incomplete. Request a new one from{" "}
          <Link href="/forgot-password" className="text-accent font-medium">
            forgot password
          </Link>
          .
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            required
            minLength={8}
            className="rounded-[var(--radius-md)] bg-surface border border-border px-4 py-3 text-[14px] outline-none focus:border-accent transition-colors"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
            required
            minLength={8}
            className="rounded-[var(--radius-md)] bg-surface border border-border px-4 py-3 text-[14px] outline-none focus:border-accent transition-colors"
          />
          {error && <p className="text-[12.5px] text-danger">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-1 px-4 py-3 rounded-[var(--radius-pill)] bg-accent text-accent-foreground text-[14px] font-medium disabled:opacity-50"
          >
            {busy ? "Saving..." : "Save password"}
          </button>
        </form>
      )}

      <p className="text-center text-[13px] text-muted mt-6">
        <Link href="/login" className="text-accent font-medium">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

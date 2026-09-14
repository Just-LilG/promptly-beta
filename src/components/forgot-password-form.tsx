"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/card";
import { BrandMark } from "@/components/brand-mark";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/account/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Could not send that.");
        return;
      }
      setDone(true);
    } catch {
      setError("Could not send that.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 pt-16 pb-8 min-h-dvh flex flex-col">
      <div className="flex flex-col items-center mb-8">
        <BrandMark size={48} className="w-12 h-12 rounded-[var(--radius-md)] mb-4" alt="Promptly" />
        <h1 className="text-[22px] font-semibold tracking-tight">Forgot password</h1>
        <p className="text-muted text-[13.5px] mt-1 text-center">
          Enter the email on your account. If it matches, we send a reset link.
        </p>
      </div>

      {done ? (
        <Card className="p-5">
          <p className="text-[14px] leading-relaxed">
            If that email has an account, check your inbox for a reset link. It expires in one hour.
          </p>
        </Card>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="rounded-[var(--radius-md)] bg-surface border border-border px-4 py-3 text-[14px] outline-none focus:border-accent transition-colors"
          />
          {error && (
            <p className="text-[12.5px] text-danger">{error}</p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="mt-1 px-4 py-3 rounded-[var(--radius-pill)] bg-accent text-accent-foreground text-[14px] font-medium disabled:opacity-50"
          >
            {busy ? "Sending..." : "Send reset link"}
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

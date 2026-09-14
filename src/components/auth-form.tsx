"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { GoogleLogo } from "@/icons";
import { Card } from "@/components/card";
import { BrandMark } from "@/components/brand-mark";

export function AuthForm({ mode, googleEnabled }: { mode: "login" | "signup"; googleEnabled: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === "signup";

  const handleGoogle = () => {
    signIn("google", { callbackUrl: "/" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isSignup) {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        const body = await res.json();
        if (!res.ok) {
          setError(body.error ?? "Something went wrong.");
          setIsSubmitting(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Incorrect email or password.");
        setIsSubmitting(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-4 pt-16 pb-8 min-h-dvh flex flex-col">
      <div className="flex flex-col items-center mb-8">
        <BrandMark size={48} className="w-12 h-12 rounded-[var(--radius-md)] mb-4" alt="Promptly" />
        <h1 className="text-[22px] font-semibold tracking-tight">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-muted text-[13.5px] mt-1 text-center">
          {isSignup
            ? "Your name will show on the home screen, and progress can sync across devices."
            : "Sign in to continue where you left off."}
        </p>
      </div>

      {googleEnabled && (
        <>
          <button
            onClick={handleGoogle}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-[var(--radius-pill)] bg-surface border border-border text-[14px] font-medium active:scale-[0.98] transition-transform"
          >
            <GoogleLogo className="w-[18px] h-[18px]" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[12px] text-muted-soft">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {isSignup && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="rounded-[var(--radius-md)] bg-surface border border-border px-4 py-3 text-[14px] outline-none focus:border-accent transition-colors"
          />
        )}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="rounded-[var(--radius-md)] bg-surface border border-border px-4 py-3 text-[14px] outline-none focus:border-accent transition-colors"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          minLength={8}
          className="rounded-[var(--radius-md)] bg-surface border border-border px-4 py-3 text-[14px] outline-none focus:border-accent transition-colors"
        />

        {error && (
          <Card className="p-3">
            <p className="text-[12.5px] text-danger">{error}</p>
          </Card>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 px-4 py-3 rounded-[var(--radius-pill)] bg-accent text-accent-foreground text-[14px] font-medium disabled:opacity-50 active:scale-[0.98] transition-transform"
        >
          {isSubmitting ? "Please wait..." : isSignup ? "Create account" : "Sign in"}
        </button>
      </form>

      {!isSignup && (
        <p className="text-center text-[13px] mt-3">
          <Link href="/forgot-password" className="text-accent font-medium">
            Forgot password?
          </Link>
        </p>
      )}

      <p className="text-center text-[13px] text-muted mt-6">
        {isSignup ? "Already have an account? " : "Don't have an account? "}
        <Link href={isSignup ? "/login" : "/signup"} className="text-accent font-medium">
          {isSignup ? "Sign in" : "Sign up"}
        </Link>
      </p>
    </div>
  );
}

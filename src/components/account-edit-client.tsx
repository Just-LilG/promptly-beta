"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { CaretLeft, SignOut } from "@/icons";
import { Card } from "@/components/card";
import { AvatarPicker } from "@/components/avatar-picker";
import { AccountSkeleton } from "@/components/skeleton";
import { useI18n } from "@/components/locale-provider";

const fieldClass =
  "w-full rounded-[var(--radius-md)] bg-background border border-border px-4 py-3 text-[14px] outline-none focus:border-accent transition-colors";

export function AccountEditClient() {
  const { t } = useI18n();
  const { data: session, status, update } = useSession();
  const [name, setName] = useState("");
  const [hasPassword, setHasPassword] = useState(true);
  const [nameStatus, setNameStatus] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    void fetch("/api/account/profile")
      .then((res) => res.json())
      .then((body) => {
        if (cancelled) return;
        if (typeof body.name === "string") setName(body.name);
        else if (session?.user?.name) setName(session.user.name);
        setHasPassword(Boolean(body.hasPassword));
      })
      .catch(() => {
        if (session?.user?.name) setName(session.user.name);
      });
    return () => {
      cancelled = true;
    };
  }, [status, session?.user?.name]);

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);
    setNameStatus(null);
    setSavingName(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const body = await res.json();
      if (!res.ok) {
        setNameError(body.error ?? t("account.nameFail"));
        return;
      }
      await update({ name: body.name });
      setNameStatus(t("account.nameSaved"));
    } catch {
      setNameError(t("account.nameFail"));
    } finally {
      setSavingName(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordStatus(null);
    if (newPassword !== confirmPassword) {
      setPasswordError(t("account.passwordMismatch"));
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: hasPassword ? currentPassword : undefined,
          newPassword,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setPasswordError(body.error ?? t("account.passwordFail"));
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setHasPassword(true);
      setPasswordStatus(hasPassword ? t("account.passwordUpdated") : t("account.passwordSet"));
    } catch {
      setPasswordError(t("account.passwordFail"));
    } finally {
      setSavingPassword(false);
    }
  };

  if (status === "loading") return <AccountSkeleton />;

  return (
    <div className="page-no-topbar max-w-md mx-auto px-4 md:px-8 pb-8">
      <Link href="/account" className="inline-flex items-center gap-1 text-[13px] text-muted mb-4">
        <CaretLeft className="w-3.5 h-3.5" />
        {t("account.back")}
      </Link>
      <h1 className="text-[22px] font-semibold tracking-tight">{t("account.editProfile")}</h1>
      <p className="text-muted text-[14px] mt-1.5">{t("account.editProfileHint")}</p>

      <Card className="p-5 mt-5">
        <AvatarPicker />
      </Card>

      {status === "unauthenticated" && (
        <p className="mt-4 text-[13.5px] text-muted">{t("account.signInKeep")}</p>
      )}

      {status === "authenticated" && session?.user && (
        <div className="mt-3 flex flex-col gap-3">
          <Card className="p-5">
            <p className="text-[12.5px] text-muted truncate">{session.user.email}</p>
            <form onSubmit={saveName} className="mt-3 flex flex-col gap-2.5">
              <label className="text-[13px] font-medium">{t("account.displayName")}</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("account.yourName")}
                maxLength={40}
                required
                className={fieldClass}
              />
              {nameError && <p className="text-[12.5px] text-danger">{nameError}</p>}
              {nameStatus && <p className="text-[12.5px] text-accent">{nameStatus}</p>}
              <button
                type="submit"
                disabled={savingName}
                className="px-4 py-2.5 rounded-[var(--radius-pill)] bg-accent text-accent-foreground text-[13.5px] font-medium disabled:opacity-50 active:scale-95"
              >
                {savingName ? t("account.saving") : t("account.saveName")}
              </button>
            </form>
          </Card>

          <Card className="p-5">
            <p className="text-[14px] font-medium">
              {hasPassword ? t("account.changePassword") : t("account.setPassword")}
            </p>
            <p className="text-[12.5px] text-muted mt-0.5">
              {hasPassword ? t("account.changePasswordHint") : t("account.setPasswordHint")}
            </p>
            <form onSubmit={savePassword} className="mt-3 flex flex-col gap-2.5">
              {hasPassword && (
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={t("account.currentPassword")}
                  required
                  className={fieldClass}
                />
              )}
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("account.newPassword")}
                required
                minLength={8}
                className={fieldClass}
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("account.confirmPassword")}
                required
                minLength={8}
                className={fieldClass}
              />
              {passwordError && <p className="text-[12.5px] text-danger">{passwordError}</p>}
              {passwordStatus && <p className="text-[12.5px] text-accent">{passwordStatus}</p>}
              <button
                type="submit"
                disabled={savingPassword}
                className="px-4 py-2.5 rounded-[var(--radius-pill)] bg-surface border border-border text-[13.5px] font-medium disabled:opacity-50 active:scale-95"
              >
                {savingPassword
                  ? t("account.saving")
                  : hasPassword
                    ? t("account.savePassword")
                    : t("account.setPassword")}
              </button>
            </form>
          </Card>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-pill)] bg-surface border border-border text-[13.5px] font-medium active:scale-95"
          >
            <SignOut className="w-4 h-4" />
            {t("account.signOut")}
          </button>
        </div>
      )}
    </div>
  );
}

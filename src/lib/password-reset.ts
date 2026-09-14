import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/db";

const RESET_MS = 60 * 60 * 1000;

export function hashResetToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

export function newResetToken() {
  return randomBytes(32).toString("hex");
}

export function resetIdentifier(email: string) {
  return `reset:${email}`;
}

export async function createPasswordReset(email: string) {
  const raw = newResetToken();
  const token = hashResetToken(raw);
  const identifier = resetIdentifier(email);
  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires: new Date(Date.now() + RESET_MS),
    },
  });
  return raw;
}

export async function consumePasswordReset(email: string, rawToken: string) {
  const identifier = resetIdentifier(email);
  const token = hashResetToken(rawToken);
  const row = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier, token } },
  });
  if (!row || row.expires < new Date()) return false;
  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier, token } },
  });
  return true;
}

export function appOrigin(requestUrl: string) {
  if (process.env.AUTH_URL) return process.env.AUTH_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  try {
    return new URL(requestUrl).origin;
  } catch {
    return "";
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info(`[password-reset] Email not configured. Reset link for ${email}: ${resetUrl}`);
    return { sent: false };
  }

  const from = process.env.EMAIL_FROM ?? "Promptly <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Reset your Promptly password",
      html: `<p>You asked to reset your Promptly password.</p><p><a href="${resetUrl}">Choose a new password</a></p><p>This link expires in one hour. If you did not ask for this, you can ignore the email.</p>`,
    }),
  });

  if (!res.ok) {
    console.error("[password-reset] Resend failed", await res.text());
    return { sent: false };
  }
  return { sent: true };
}

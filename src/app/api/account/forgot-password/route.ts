import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import {
  appOrigin,
  createPasswordReset,
  sendPasswordResetEmail,
} from "@/lib/password-reset";

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return Response.json({ error: "Enter a valid email." }, { status: 400 });
  }

  // Same reply either way so this cannot be used to probe which emails exist.
  const ok = Response.json({
    ok: true,
    message: "If that email has an account, we sent a reset link.",
  });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.password) return ok;

  const raw = await createPasswordReset(email);
  const origin = appOrigin(req.url);
  const resetUrl = `${origin}/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(raw)}`;
  await sendPasswordResetEmail(email, resetUrl);

  return ok;
}

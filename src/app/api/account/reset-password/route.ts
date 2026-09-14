import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { consumePasswordReset } from "@/lib/password-reset";

export async function POST(req: NextRequest) {
  let body: { email?: string; token?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const token = body.token?.trim();
  const password = body.password ?? "";

  if (!email || !token) {
    return Response.json({ error: "This reset link is missing pieces." }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.password) {
    return Response.json({ error: "This reset link is invalid or expired." }, { status: 400 });
  }

  const valid = await consumePasswordReset(email, token);
  if (!valid) {
    return Response.json({ error: "This reset link is invalid or expired." }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hash },
  });

  return Response.json({ ok: true });
}

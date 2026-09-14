import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "Sign in first." }, { status: 401 });

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const newPassword = body.newPassword ?? "";
  if (newPassword.length < 8) {
    return Response.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return Response.json({ error: "Account not found." }, { status: 404 });

  if (user.password) {
    if (!body.currentPassword) {
      return Response.json({ error: "Enter your current password." }, { status: 400 });
    }
    const ok = await bcrypt.compare(body.currentPassword, user.password);
    if (!ok) {
      return Response.json({ error: "Current password is incorrect." }, { status: 400 });
    }
  }

  const password = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { password },
  });

  return Response.json({ ok: true });
}

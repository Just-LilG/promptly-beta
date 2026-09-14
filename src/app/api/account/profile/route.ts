import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

async function signedInUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function GET() {
  const userId = await signedInUserId();
  if (!userId) return Response.json({ error: "Sign in first." }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, password: true },
  });
  if (!user) return Response.json({ error: "Account not found." }, { status: 404 });

  return Response.json({
    name: user.name ?? "",
    email: user.email,
    hasPassword: Boolean(user.password),
  });
}

export async function PUT(req: NextRequest) {
  const userId = await signedInUserId();
  if (!userId) return Response.json({ error: "Sign in first." }, { status: 401 });

  let body: { name?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  if (name.length < 1 || name.length > 40) {
    return Response.json({ error: "Name must be between 1 and 40 characters." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { name },
  });

  return Response.json({ name });
}

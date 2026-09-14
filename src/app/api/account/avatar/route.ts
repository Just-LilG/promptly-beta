import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getOrCreateUserId } from "@/lib/user-session";

const MAX_IMAGE_CHARS = 120_000;

export async function PUT(req: NextRequest) {
  let body: { image?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const image = body.image?.trim();
  if (!image) {
    return Response.json({ error: "A picture is required." }, { status: 400 });
  }
  const allowed =
    image.startsWith("https://api.dicebear.com/") || image.startsWith("data:image/");
  if (!allowed) {
    return Response.json({ error: "That picture source is not allowed." }, { status: 400 });
  }
  if (image.length > MAX_IMAGE_CHARS) {
    return Response.json({ error: "That picture is too large." }, { status: 400 });
  }

  const userId = await getOrCreateUserId();
  await prisma.user.update({
    where: { id: userId },
    data: { image },
  });

  return Response.json({ ok: true });
}

import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const ANON_COOKIE = "promptly_uid";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const name = body.name?.trim();

  if (!email || !email.includes("@")) {
    return Response.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return Response.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Deliberately vague — doesn't reveal whether the account exists via
    // OAuth vs. credentials, since that's information an attacker could use.
    return Response.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // If this browser already has an anonymous user row (from using the app
  // before signing up), attach the new credentials to that same row instead
  // of creating a second, disconnected one — this is what actually preserves
  // their existing progress/history without needing a separate merge step.
  const store = await cookies();
  const anonId = store.get(ANON_COOKIE)?.value;
  const anonUser = anonId ? await prisma.user.findUnique({ where: { id: anonId } }) : null;

  const user = anonUser
    ? await prisma.user.update({
        where: { id: anonUser.id },
        data: { email, password: passwordHash, name: name || undefined },
      })
    : await prisma.user.create({
        data: { id: `usr_${crypto.randomUUID()}`, email, password: passwordHash, name },
      });

  return Response.json({ id: user.id, email: user.email }, { status: 201 });
}

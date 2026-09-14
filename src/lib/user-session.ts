import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

const COOKIE = "promptly_uid";
const ONE_YEAR = 60 * 60 * 24 * 365;

function newUserId() {
  return `usr_${crypto.randomUUID()}`;
}

// Resolves to the current user's id, preferring a real signed-in NextAuth
// session over the anonymous cookie. This matters because of what happens on
// login: auth.ts's signIn callback merges the anonymous row's data into the
// authenticated user and DELETES the anonymous row, but it doesn't (and
// can't, from inside that callback) update this cookie to point at the new
// id. Without this session check, the next call here would find the cookie
// pointing at a user that no longer exists and silently create a fresh,
// empty anonymous row — orphaning a just-logged-in user from the account
// they were signing into for anything that reads/writes through this path.
export async function getOrCreateUserId(): Promise<string> {
  const session = await auth();
  if (session?.user?.id) {
    return session.user.id;
  }

  const store = await cookies();
  const existing = store.get(COOKIE)?.value;
  if (existing) {
    const user = await prisma.user.findUnique({ where: { id: existing } });
    if (user) return user.id;
  }

  const id = newUserId();
  await prisma.user.create({ data: { id } });
  store.set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR,
  });
  return id;
}

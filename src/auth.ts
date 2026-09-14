import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { isGoogleAuthConfigured } from "@/lib/auth-config";

const ANON_COOKIE = "promptly_uid";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: {
    // JWT works with the Credentials provider (database sessions can't,
    // since there's no browser redirect/callback to attach a session row
    // to) — using JWT uniformly keeps both sign-in paths consistent.
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    // Empty Google client id/secret makes Auth.js throw the generic
    // "server configuration" page on every /api/auth/* request, including
    // session checks. Only register Google when the keys are actually set.
    ...(isGoogleAuthConfigured()
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        // No account, or an OAuth-only account with no password set — the
        // second case matters: someone who signed up with Google shouldn't
        // be able to guess their way in via a password that was never set.
        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  callbacks: {
    // The core "claim anonymous data on login" behavior: if this browser
    // already has an anonymous user row (from the pre-login cookie in
    // user-session.ts) and it's a *different* row than the one Auth.js is
    // about to sign in as, merge the anonymous row's data onto the login
    // identity and delete the now-empty anonymous row — so a returning
    // user's history isn't silently orphaned the moment they create an account.
    async signIn({ user }) {
      if (!user.id) return true;

      const store = await cookies();
      const anonId = store.get(ANON_COOKIE)?.value;
      if (!anonId || anonId === user.id) return true;

      const anonUser = await prisma.user.findUnique({
        where: { id: anonId },
        include: { onboarding: true, streak: true },
      });
      if (!anonUser) return true;

      const [existingOnboarding, existingStreak] = await Promise.all([
        prisma.onboarding.findUnique({ where: { userId: user.id } }),
        prisma.streak.findUnique({ where: { userId: user.id } }),
      ]);

      // Onboarding/Streak are one-per-user (userId is their primary key), so
      // they can only be re-pointed if the destination doesn't already have
      // one — otherwise this would violate that uniqueness constraint. If
      // the logged-in account already has its own, the anonymous session's
      // version is simply dropped in favor of the account's existing one,
      // rather than erroring the whole sign-in.
      const ops = [];
      if (anonUser.onboarding && !existingOnboarding) {
        ops.push(
          prisma.onboarding.update({ where: { userId: anonId }, data: { userId: user.id } })
        );
      }
      if (anonUser.streak && !existingStreak) {
        ops.push(prisma.streak.update({ where: { userId: anonId }, data: { userId: user.id } }));
      }

      // Progress rows are unique per (userId, trackSlug, scenarioSlug) — if
      // the logged-in account already completed the same scenario anonymously
      // on another device, a blind updateMany would hit that constraint and
      // roll back the whole transaction. Anonymous rows that don't conflict
      // migrate normally; ones that do are simply dropped, since the
      // account's own completion record is the one that should win.
      const anonProgress = await prisma.progress.findMany({ where: { userId: anonId } });
      const existingProgressKeys = new Set(
        (
          await prisma.progress.findMany({
            where: { userId: user.id },
            select: { trackSlug: true, scenarioSlug: true },
          })
        ).map((p: { trackSlug: string; scenarioSlug: string }) => `${p.trackSlug}:${p.scenarioSlug}`)
      );
      const progressOps = anonProgress
        .filter(
          (p: { trackSlug: string; scenarioSlug: string }) =>
            !existingProgressKeys.has(`${p.trackSlug}:${p.scenarioSlug}`)
        )
        .map((p: { id: string }) =>
          prisma.progress.update({ where: { id: p.id }, data: { userId: user.id } })
        );

      await prisma.$transaction([
        ...ops,
        ...progressOps,
        prisma.conversation.updateMany({ where: { userId: anonId }, data: { userId: user.id } }),
        prisma.workflow.updateMany({ where: { userId: anonId }, data: { userId: user.id } }),
        prisma.taskEvaluation.updateMany({ where: { userId: anonId }, data: { userId: user.id } }),
        // Delete any leftover onboarding/streak/progress rows on the anonymous
        // user that couldn't be migrated (destination already had a
        // conflicting one) — otherwise the anonymous User row can't be
        // deleted due to the relation.
        prisma.onboarding.deleteMany({ where: { userId: anonId } }),
        prisma.streak.deleteMany({ where: { userId: anonId } }),
        prisma.progress.deleteMany({ where: { userId: anonId } }),
        prisma.user.delete({ where: { id: anonId } }),
      ]);

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        if (user.image) token.picture = user.image;
        if (user.name) token.name = user.name;
      }
      if (trigger === "update" && session) {
        const next = session as { image?: string; name?: string; user?: { image?: string; name?: string } };
        const image = next.image ?? next.user?.image;
        const name = next.name ?? next.user?.name;
        if (image !== undefined) token.picture = image;
        if (name !== undefined) token.name = name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        if (typeof token.picture === "string") session.user.image = token.picture;
        if (typeof token.name === "string") session.user.name = token.name;
      }
      return session;
    },
  },
});

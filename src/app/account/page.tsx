import { AccountClient } from "@/components/account-client";

// This page reads the signed-in user's session via useSession(), which only
// has real data at request time (it depends on cookies) — there is no
// meaningful "static" version of this page to prerender at build time.
// Forcing dynamic rendering here, on the server component, is what actually
// works: `dynamic` cannot be exported from the "use client" file itself.
export const dynamic = "force-dynamic";

export default function AccountPage() {
  return <AccountClient />;
}

// Server-only check for whether Google OAuth is actually configured. Used to
// hide the "Continue with Google" button when it's not — clicking a button
// that's wired to a provider with no credentials set produces a confusing
// error instead of a working sign-in, so the button simply shouldn't exist
// in that case.
export function isGoogleAuthConfigured(): boolean {
  return Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
}

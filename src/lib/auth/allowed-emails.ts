/**
 * @deprecated Phase 5.3 — sign-in is gated by `User` rows in the database
 * (`src/lib/auth/sign-in-gate.ts`). Kept for reference only; not used by Auth.js.
 */
export function getAllowedEmails(): string[] {
  const raw = process.env.AUTH_ALLOWED_EMAILS ?? "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/** @deprecated Use `isEmailInvitedForSignIn` instead. */
export function isEmailAllowed(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = getAllowedEmails();
  if (allowed.length === 0) return false;
  return allowed.includes(email.toLowerCase());
}

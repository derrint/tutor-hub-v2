import { prisma } from "@/lib/db/prisma";

/** Phase 5.3: sign-in allowed only for emails with a `User` row in the database. */
export async function isEmailInvitedForSignIn(
  email: string | null | undefined,
): Promise<boolean> {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return false;

  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true },
  });
  return user != null;
}

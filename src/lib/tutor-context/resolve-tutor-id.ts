import { auth } from "@/auth";
import {
  BOOTSTRAP_TUTOR_1_ID,
  BOOTSTRAP_TUTOR_1_EMAIL,
} from "@/lib/auth/bootstrap-users";
import { prisma } from "@/lib/db/prisma";

/**
 * Phase 5.1 interim: scope DB reads/writes to the signed-in tutor.
 * ADMIN defaults to tutor_1 until the picker ships (Phase 5.4).
 */
export async function resolveTutorIdForRequest(): Promise<string> {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) {
    return BOOTSTRAP_TUTOR_1_ID;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true, tutorId: true },
  });

  if (!user) {
    return BOOTSTRAP_TUTOR_1_ID;
  }

  if (user.role === "TUTOR" && user.tutorId) {
    return user.tutorId;
  }

  if (user.role === "ADMIN") {
    return BOOTSTRAP_TUTOR_1_ID;
  }

  return BOOTSTRAP_TUTOR_1_ID;
}

/** Dev fallback label when no session (should not happen behind auth). */
export function defaultBootstrapTutorEmailForDocs(): string {
  return BOOTSTRAP_TUTOR_1_EMAIL;
}

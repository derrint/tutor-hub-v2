import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { ACTIVE_TUTOR_COOKIE_NAME } from "@/lib/tutor-context/constants";
import { getRequestUser } from "@/lib/tutor-context/get-request-user";

async function resolveAdminActiveTutorIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(ACTIVE_TUTOR_COOKIE_NAME)?.value?.trim();
  if (!fromCookie) {
    return null;
  }

  const tutor = await prisma.tutor.findUnique({
    where: { id: fromCookie },
    select: { id: true },
  });
  return tutor?.id ?? null;
}

/**
 * Active tutor for the current request: TUTOR → their `tutorId`;
 * ADMIN → validated cookie only (no default until picker / 5.4 switcher).
 * Unauthenticated → `null`.
 */
export async function getActiveTutorId(): Promise<string | null> {
  const user = await getRequestUser();
  if (!user) {
    return null;
  }

  if (user.role === "TUTOR" && user.tutorId) {
    return user.tutorId;
  }

  if (user.role === "ADMIN") {
    return resolveAdminActiveTutorIdFromCookie();
  }

  return null;
}

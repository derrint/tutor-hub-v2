import { cookies } from "next/headers";
import { BOOTSTRAP_TUTOR_1_ID } from "@/lib/auth/bootstrap-users";
import { prisma } from "@/lib/db/prisma";
import {
  ACTIVE_TUTOR_COOKIE_NAME,
} from "@/lib/tutor-context/constants";
import { getRequestUser } from "@/lib/tutor-context/get-request-user";

async function resolveAdminActiveTutorId(): Promise<string> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(ACTIVE_TUTOR_COOKIE_NAME)?.value?.trim();
  if (!fromCookie) {
    return BOOTSTRAP_TUTOR_1_ID;
  }

  const tutor = await prisma.tutor.findUnique({
    where: { id: fromCookie },
    select: { id: true },
  });
  return tutor?.id ?? BOOTSTRAP_TUTOR_1_ID;
}

/**
 * Active tutor for the current request: TUTOR users → their `tutorId`;
 * ADMIN → cookie `tutor-hub-active-tutor-id` (validated), else tutor_1 default.
 */
export async function getActiveTutorId(): Promise<string> {
  const user = await getRequestUser();
  if (!user) {
    return BOOTSTRAP_TUTOR_1_ID;
  }

  if (user.role === "TUTOR" && user.tutorId) {
    return user.tutorId;
  }

  if (user.role === "ADMIN") {
    return resolveAdminActiveTutorId();
  }

  return BOOTSTRAP_TUTOR_1_ID;
}

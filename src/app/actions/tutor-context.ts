"use server";

import { revalidateAdminRoutes } from "@/lib/db/revalidate-admin";
import { prisma } from "@/lib/db/prisma";
import {
  ACTIVE_TUTOR_COOKIE_MAX_AGE_SECONDS,
  ACTIVE_TUTOR_COOKIE_NAME,
} from "@/lib/tutor-context/constants";
import { getRequestUser } from "@/lib/tutor-context/get-request-user";
import { cookies } from "next/headers";

export async function setActiveTutorIdAction(
  tutorId: string,
): Promise<{ ok: true } | { ok: false; reason: "forbidden" | "not_found" }> {
  const user = await getRequestUser();
  if (!user || user.role !== "ADMIN") {
    return { ok: false, reason: "forbidden" };
  }

  const tutor = await prisma.tutor.findUnique({
    where: { id: tutorId.trim() },
    select: { id: true },
  });
  if (!tutor) {
    return { ok: false, reason: "not_found" };
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_TUTOR_COOKIE_NAME, tutor.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACTIVE_TUTOR_COOKIE_MAX_AGE_SECONDS,
  });

  revalidateAdminRoutes();
  return { ok: true };
}

export async function clearActiveTutorCookieAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACTIVE_TUTOR_COOKIE_NAME);
}

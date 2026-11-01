"use server";

import { AdminRequiredError, requireAdminUser } from "@/lib/auth/require-admin-user";
import { prisma } from "@/lib/db/prisma";
import {
  revalidateAdminRoutes,
  revalidatePlatformAdminRoutes,
} from "@/lib/db/revalidate-admin";
import type { UserRole } from "@prisma/client";
import { Prisma } from "@prisma/client";

export type AdminUserInput = {
  id?: string;
  email: string;
  role: UserRole;
  tutorId: string;
};

export type AdminUserActionResult =
  | { ok: true; id: string }
  | {
      ok: false;
      error: "FORBIDDEN" | "VALIDATION" | "CONFLICT";
      field?: "email" | "role" | "tutorId";
    };

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export async function upsertAdminUserAction(
  input: AdminUserInput,
): Promise<AdminUserActionResult> {
  try {
    await requireAdminUser();
  } catch (error) {
    if (error instanceof AdminRequiredError) {
      return { ok: false, error: "FORBIDDEN" };
    }
    throw error;
  }

  const email = normalizeEmail(input.email);
  if (!email || !email.includes("@")) {
    return { ok: false, error: "VALIDATION", field: "email" };
  }

  const role = input.role;
  if (role !== "ADMIN" && role !== "TEACHER") {
    return { ok: false, error: "VALIDATION", field: "role" };
  }

  const tutorId =
    role === "TEACHER" ? input.tutorId.trim() || null : null;
  if (role === "TEACHER" && !tutorId) {
    return { ok: false, error: "VALIDATION", field: "tutorId" };
  }

  if (role === "TEACHER" && tutorId) {
    const tutor = await prisma.tutor.findUnique({
      where: { id: tutorId },
      select: { id: true },
    });
    if (!tutor) {
      return { ok: false, error: "VALIDATION", field: "tutorId" };
    }
  }

  try {
    if (input.id) {
      await prisma.user.update({
        where: { id: input.id },
        data: { email, role, tutorId },
      });
      revalidatePlatformAdminRoutes();
      revalidateAdminRoutes();
      return { ok: true, id: input.id };
    }

    const created = await prisma.user.create({
      data: { email, role, tutorId },
    });
    revalidatePlatformAdminRoutes();
    revalidateAdminRoutes();
    return { ok: true, id: created.id };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: false, error: "CONFLICT", field: "email" };
    }
    throw error;
  }
}

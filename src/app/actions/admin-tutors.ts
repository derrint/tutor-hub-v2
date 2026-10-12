"use server";

import { AdminRequiredError, requireAdminUser } from "@/lib/auth/require-admin-user";
import { prisma } from "@/lib/db/prisma";
import {
  revalidateAdminRoutes,
  revalidatePlatformAdminRoutes,
} from "@/lib/db/revalidate-admin";
import { Prisma } from "@prisma/client";

export type AdminTutorInput = {
  id?: string;
  displayName: string;
  slug: string;
  accountHolderName: string;
  bankName: string;
  bankAccountNumber: string;
  whatsappNumber: string;
};

export type AdminTutorActionResult =
  | { ok: true; id: string }
  | {
      ok: false;
      error: "FORBIDDEN" | "VALIDATION" | "CONFLICT";
      field?: "slug" | "displayName";
    };

function normalizeSlug(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed)) {
    return null;
  }
  return trimmed;
}

function nullableTrim(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function upsertAdminTutorAction(
  input: AdminTutorInput,
): Promise<AdminTutorActionResult> {
  try {
    await requireAdminUser();
  } catch (error) {
    if (error instanceof AdminRequiredError) {
      return { ok: false, error: "FORBIDDEN" };
    }
    throw error;
  }

  const displayName = input.displayName.trim();
  if (!displayName) {
    return { ok: false, error: "VALIDATION", field: "displayName" };
  }

  const slugRaw = input.slug.trim();
  let slug: string | null = null;
  if (slugRaw) {
    slug = normalizeSlug(slugRaw);
    if (!slug) {
      return { ok: false, error: "VALIDATION", field: "slug" };
    }
  }

  const data = {
    displayName,
    slug,
    accountHolderName: nullableTrim(input.accountHolderName),
    bankName: nullableTrim(input.bankName),
    bankAccountNumber: nullableTrim(input.bankAccountNumber),
    whatsappNumber: nullableTrim(input.whatsappNumber),
  };

  try {
    if (input.id) {
      await prisma.tutor.update({
        where: { id: input.id },
        data,
      });
      revalidatePlatformAdminRoutes();
      revalidateAdminRoutes();
      return { ok: true, id: input.id };
    }

    const created = await prisma.tutor.create({ data });
    revalidatePlatformAdminRoutes();
    revalidateAdminRoutes();
    return { ok: true, id: created.id };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: false, error: "CONFLICT", field: "slug" };
    }
    throw error;
  }
}

"use server";

import { revalidateAdminRoutes } from "@/lib/db/revalidate-admin";
import { mapProfile } from "@/lib/db/mappers";
import { prisma } from "@/lib/db/prisma";
import { resolveTutorIdForRequest } from "@/lib/tutor-context/resolve-tutor-id";
import type { TutorProfile } from "@/lib/domain/types";

export type TutorProfileInput = {
  studioName: string;
  accountHolderName: string;
  bankName: string;
  bankAccountNumber: string;
  whatsappNumber: string;
};

export async function upsertTutorProfileAction(
  input: TutorProfileInput,
): Promise<TutorProfile> {
  const data = {
    studioName: input.studioName.trim() || "TutorHub",
    accountHolderName: input.accountHolderName.trim() || null,
    bankName: input.bankName.trim() || null,
    bankAccountNumber: input.bankAccountNumber.trim() || null,
    whatsappNumber: input.whatsappNumber.trim() || null,
  };

  const tutorId = await resolveTutorIdForRequest();
  const existing = await prisma.profile.findUnique({
    where: { tutorId },
    select: { id: true },
  });

  const row = existing
    ? await prisma.profile.update({
        where: { id: existing.id },
        data,
      })
    : await prisma.profile.create({ data: { ...data, tutorId } });

  revalidateAdminRoutes();
  return mapProfile(row);
}

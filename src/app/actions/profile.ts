"use server";

import { revalidateAdminRoutes } from "@/lib/db/revalidate-admin";
import { mapTutorProfile } from "@/lib/db/mappers";
import { prisma } from "@/lib/db/prisma";
import type { TutorProfile } from "@/lib/domain/types";
import { requireActiveTutorId } from "@/lib/tutor-context/require-active-tutor-id";

export type TutorProfileInput = {
  accountHolderName: string;
  bankName: string;
  bankAccountNumber: string;
  whatsappNumber: string;
};

export async function upsertTutorProfileAction(
  input: TutorProfileInput,
): Promise<TutorProfile> {
  const tutorId = await requireActiveTutorId();

  const data = {
    accountHolderName: input.accountHolderName.trim() || null,
    bankName: input.bankName.trim() || null,
    bankAccountNumber: input.bankAccountNumber.trim() || null,
    whatsappNumber: input.whatsappNumber.trim() || null,
  };

  const row = await prisma.tutor.update({
    where: { id: tutorId },
    data,
  });

  revalidateAdminRoutes();
  return mapTutorProfile(row);
}

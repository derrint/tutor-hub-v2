import { prisma } from "@/lib/db/prisma";
import type { UserRole } from "@prisma/client";

export type DbAuthUser = {
  id: string;
  email: string;
  role: UserRole;
  tutorId: string | null;
};

export async function loadUserByEmail(
  email: string,
): Promise<DbAuthUser | null> {
  const normalized = email.trim().toLowerCase();
  const row = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true, email: true, role: true, tutorId: true },
  });
  return row;
}

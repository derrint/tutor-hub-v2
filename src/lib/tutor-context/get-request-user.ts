import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import type { UserRole } from "@prisma/client";

export type RequestUser = {
  email: string;
  role: UserRole;
  tutorId: string | null;
};

export async function getRequestUser(): Promise<RequestUser | null> {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) return null;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true, tutorId: true },
  });
  if (!user) return null;

  return {
    email,
    role: user.role,
    tutorId: user.tutorId,
  };
}

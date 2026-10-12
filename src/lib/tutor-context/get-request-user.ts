import { auth } from "@/auth";
import { loadUserByEmail } from "@/lib/auth/load-user-by-email";
import type { UserRole } from "@prisma/client";

export type RequestUser = {
  id: string;
  email: string;
  role: UserRole;
  tutorId: string | null;
};

export async function getRequestUser(): Promise<RequestUser | null> {
  const session = await auth();
  const user = session?.user;
  const email = user?.email?.trim().toLowerCase();
  if (!email || !user) return null;

  if (user.id && user.role) {
    return {
      id: user.id,
      email,
      role: user.role,
      tutorId: user.tutorId ?? null,
    };
  }

  const dbUser = await loadUserByEmail(email);
  if (!dbUser) return null;

  return dbUser;
}

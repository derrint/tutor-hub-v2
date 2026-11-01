import { getRequestUser } from "@/lib/tutor-context/get-request-user";
import type { RequestUser } from "@/lib/tutor-context/get-request-user";

export class AdminRequiredError extends Error {
  readonly code = "FORBIDDEN" as const;
}

export async function requireAdminUser(): Promise<RequestUser> {
  const user = await getRequestUser();
  if (!user || user.role !== "ADMIN") {
    throw new AdminRequiredError();
  }
  return user;
}

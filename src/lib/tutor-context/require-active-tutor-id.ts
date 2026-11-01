import { getActiveTutorId } from "@/lib/tutor-context/get-active-tutor-id";

export class ActiveTutorRequiredError extends Error {
  constructor() {
    super("Active tutor context is required");
    this.name = "ActiveTutorRequiredError";
  }
}

/** Server actions and API routes that mutate/read tutor-scoped data. */
export async function requireActiveTutorId(): Promise<string> {
  const tutorId = await getActiveTutorId();
  if (!tutorId) {
    throw new ActiveTutorRequiredError();
  }
  return tutorId;
}

export { getActiveTutorId } from "@/lib/tutor-context/get-active-tutor-id";
export { requireActiveTutorId } from "@/lib/tutor-context/require-active-tutor-id";

/** @deprecated Prefer `getActiveTutorId` or `requireActiveTutorId`. */
export { getActiveTutorId as resolveTutorIdForRequest } from "@/lib/tutor-context/get-active-tutor-id";

import { prisma } from "@/lib/db/prisma";

export class TutorScopeError extends Error {
  constructor(message = "Resource is not in the active tutor context") {
    super(message);
    this.name = "TutorScopeError";
  }
}

export async function assertStudentInTutor(
  studentId: string,
  tutorId: string,
): Promise<void> {
  const row = await prisma.student.findFirst({
    where: { id: studentId, tutorId },
    select: { id: true },
  });
  if (!row) {
    throw new TutorScopeError();
  }
}

export async function assertParentInTutor(
  parentId: string,
  tutorId: string,
): Promise<void> {
  const row = await prisma.parent.findFirst({
    where: { id: parentId, tutorId },
    select: { id: true },
  });
  if (!row) {
    throw new TutorScopeError();
  }
}

export async function assertScheduleRuleInTutor(
  ruleId: string,
  tutorId: string,
): Promise<void> {
  const row = await prisma.scheduleRule.findFirst({
    where: { id: ruleId, student: { tutorId } },
    select: { id: true },
  });
  if (!row) {
    throw new TutorScopeError();
  }
}

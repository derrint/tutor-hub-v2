import {
  SEED_PARENTS,
  SEED_RECURRING_SESSIONS,
  SEED_STUDENTS,
  TUTOR_PROFILE,
} from "../src/lib/mock-data";
import { calendarDateToStoredDate } from "../src/lib/datetime/calendar-date";
import {
  BOOTSTRAP_ADMIN_EMAIL,
  BOOTSTRAP_TUTOR_1_NOBARSAMBAS_EMAIL,
  BOOTSTRAP_TUTOR_1_EMAIL,
  BOOTSTRAP_TUTOR_1_ID,
  BOOTSTRAP_TUTOR_2_EMAIL,
  BOOTSTRAP_TUTOR_2_ID,
  BOOTSTRAP_USER_IDS,
} from "../src/lib/auth/bootstrap-users";
import { ensureSessionsGenerated } from "../src/lib/schedule/generate-sessions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const RULE_START_DATE = calendarDateToStoredDate(2026, 1, 1);

async function main() {
  await prisma.session.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.monthlyReport.deleteMany();
  await prisma.scheduleRule.deleteMany();
  await prisma.student.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tutor.deleteMany();

  await prisma.tutor.createMany({
    data: [
      {
        id: BOOTSTRAP_TUTOR_1_ID,
        displayName: "Tutor 1",
        slug: "tutor-1",
        bankName: TUTOR_PROFILE.bankName,
        bankAccountNumber: TUTOR_PROFILE.bankAccountNumber,
        accountHolderName: TUTOR_PROFILE.accountHolderName,
        whatsappNumber: TUTOR_PROFILE.whatsappNumber || null,
      },
      {
        id: BOOTSTRAP_TUTOR_2_ID,
        displayName: "Tutor 2",
        slug: "tutor-2",
      },
    ],
  });

  await prisma.user.createMany({
    data: [
      {
        id: BOOTSTRAP_USER_IDS.tutor1,
        email: BOOTSTRAP_TUTOR_1_EMAIL,
        role: "TUTOR",
        tutorId: BOOTSTRAP_TUTOR_1_ID,
      },
      {
        id: BOOTSTRAP_USER_IDS.tutor1Nobarsambas,
        email: BOOTSTRAP_TUTOR_1_NOBARSAMBAS_EMAIL,
        role: "TUTOR",
        tutorId: BOOTSTRAP_TUTOR_1_ID,
      },
      {
        id: BOOTSTRAP_USER_IDS.tutor2,
        email: BOOTSTRAP_TUTOR_2_EMAIL,
        role: "TUTOR",
        tutorId: BOOTSTRAP_TUTOR_2_ID,
      },
      {
        id: BOOTSTRAP_USER_IDS.admin,
        email: BOOTSTRAP_ADMIN_EMAIL,
        role: "ADMIN",
      },
    ],
  });

  for (const parent of SEED_PARENTS) {
    await prisma.parent.create({
      data: {
        id: parent.id,
        tutorId: BOOTSTRAP_TUTOR_1_ID,
        name: parent.name,
        salutation: parent.salutation,
        honorific: parent.honorific,
        whatsapp: parent.whatsapp,
      },
    });
  }

  for (const student of SEED_STUDENTS) {
    await prisma.student.create({
      data: {
        id: student.id,
        tutorId: BOOTSTRAP_TUTOR_1_ID,
        name: student.name,
        age: student.age,
        level: student.level,
        feePerSession: student.feePerSession,
        status: student.status,
        parentId: student.parentId,
        calendarColorKey: student.calendarColorKey,
      },
    });
  }

  for (const recurring of SEED_RECURRING_SESSIONS) {
    for (const dayOfWeek of recurring.daysOfWeek) {
      await prisma.scheduleRule.create({
        data: {
          id: `${recurring.id}-d${dayOfWeek}`,
          studentId: recurring.studentId,
          dayOfWeek,
          startTime: recurring.startTime,
          endTime: recurring.endTime,
          startDate: RULE_START_DATE,
        },
      });
    }
  }

  await ensureSessionsGenerated(prisma);

  console.log(
    "Seed complete: tutors, users, roster, schedule rules, and sessions.",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

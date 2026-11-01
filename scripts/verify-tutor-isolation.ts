/**
 * Phase 5.2 sanity check: initial tutors exist and business rows are partitioned.
 * Run: pnpm verify:tutor-isolation
 */
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: ".env.local" });
dotenv.config();
import {
  INITIAL_TUTOR_1_ID,
  INITIAL_TUTOR_2_ID,
} from "../src/lib/auth/initial-users";

const prisma = new PrismaClient();

async function main() {
  const tutors = await prisma.tutor.findMany({ select: { id: true } });
  const tutorIds = new Set(tutors.map((t) => t.id));

  for (const required of [INITIAL_TUTOR_1_ID, INITIAL_TUTOR_2_ID]) {
    if (!tutorIds.has(required)) {
      throw new Error(`Missing tutor row: ${required}`);
    }
  }

  const tables = [
    { name: "Parent", count: () => prisma.parent.groupBy({ by: ["tutorId"], _count: true }) },
    { name: "Student", count: () => prisma.student.groupBy({ by: ["tutorId"], _count: true }) },
    { name: "Session", count: () => prisma.session.groupBy({ by: ["tutorId"], _count: true }) },
  ] as const;

  for (const table of tables) {
    const groups = await table.count();
    for (const row of groups) {
      if (row.tutorId == null || !tutorIds.has(row.tutorId)) {
        throw new Error(`${table.name} row with invalid tutorId: ${row.tutorId}`);
      }
    }
  }

  const orphanStudents = await prisma.student.count({
    where: {
      tutorId: INITIAL_TUTOR_2_ID,
    },
  });

  console.log("verify-tutor-isolation: OK");
  console.log(
    JSON.stringify(
      {
        tutors: tutors.length,
        tutor2Students: orphanStudents,
        note: "tutor_2 should stay empty until rint adds data",
      },
      null,
      2,
    ),
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

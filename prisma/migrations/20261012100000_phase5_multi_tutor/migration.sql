-- Phase 5.1: Tutor + User; backfill existing rows to tutor_1; bootstrap users.

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('TUTOR', 'ADMIN');

-- CreateTable
CREATE TABLE "Tutor" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "slug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tutor_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Tutor_slug_key" ON "Tutor"("slug");

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "tutorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_tutorId_idx" ON "User"("tutorId");

-- Nullable tutorId columns
ALTER TABLE "Profile" ADD COLUMN "tutorId" TEXT;
ALTER TABLE "Parent" ADD COLUMN "tutorId" TEXT;
ALTER TABLE "Student" ADD COLUMN "tutorId" TEXT;
ALTER TABLE "Session" ADD COLUMN "tutorId" TEXT;
ALTER TABLE "MonthlyReport" ADD COLUMN "tutorId" TEXT;
ALTER TABLE "Invoice" ADD COLUMN "tutorId" TEXT;

-- Bootstrap tutors
INSERT INTO "Tutor" ("id", "displayName", "slug", "createdAt", "updatedAt") VALUES
  ('tutor_1', 'Tutor 1', 'tutor-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('tutor_2', 'Tutor 2', 'tutor-2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Bootstrap users (Google emails; OAuth linked in Phase 5.3)
INSERT INTO "User" ("id", "email", "role", "tutorId", "createdAt", "updatedAt") VALUES
  ('user_tutor_1', 'anasandin87@gmail.com', 'TUTOR', 'tutor_1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('user_tutor_2', 'rint.cold@gmail.com', 'TUTOR', 'tutor_2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('user_admin', 'lorensioderrint@gmail.com', 'ADMIN', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Attach all existing business data to tutor_1 (no row deletes)
UPDATE "Profile" SET "tutorId" = 'tutor_1' WHERE "tutorId" IS NULL;
UPDATE "Parent" SET "tutorId" = 'tutor_1' WHERE "tutorId" IS NULL;
UPDATE "Student" SET "tutorId" = 'tutor_1' WHERE "tutorId" IS NULL;
UPDATE "Session" SET "tutorId" = 'tutor_1' WHERE "tutorId" IS NULL;
UPDATE "MonthlyReport" SET "tutorId" = 'tutor_1' WHERE "tutorId" IS NULL;
UPDATE "Invoice" SET "tutorId" = 'tutor_1' WHERE "tutorId" IS NULL;

-- Empty profile shell for tutor_2 (tutor_1 keeps existing Profile row)
INSERT INTO "Profile" ("id", "tutorId", "studioName", "createdAt", "updatedAt")
SELECT 'profile_tutor_2', 'tutor_2', 'TutorHub', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Profile" WHERE "tutorId" = 'tutor_2');

-- NOT NULL + FKs
ALTER TABLE "Profile" ALTER COLUMN "tutorId" SET NOT NULL;
ALTER TABLE "Parent" ALTER COLUMN "tutorId" SET NOT NULL;
ALTER TABLE "Student" ALTER COLUMN "tutorId" SET NOT NULL;
ALTER TABLE "Session" ALTER COLUMN "tutorId" SET NOT NULL;
ALTER TABLE "MonthlyReport" ALTER COLUMN "tutorId" SET NOT NULL;
ALTER TABLE "Invoice" ALTER COLUMN "tutorId" SET NOT NULL;

CREATE UNIQUE INDEX "Profile_tutorId_key" ON "Profile"("tutorId");

ALTER TABLE "User" ADD CONSTRAINT "User_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Parent" ADD CONSTRAINT "Parent_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Student" ADD CONSTRAINT "Student_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MonthlyReport" ADD CONSTRAINT "MonthlyReport_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "Parent_tutorId_idx" ON "Parent"("tutorId");
CREATE INDEX "Student_tutorId_idx" ON "Student"("tutorId");
CREATE INDEX "Session_tutorId_date_idx" ON "Session"("tutorId", "date");

-- Replace uniques scoped per tutor
DROP INDEX IF EXISTS "Invoice_parentId_month_year_key";
CREATE UNIQUE INDEX "Invoice_tutorId_parentId_month_year_key" ON "Invoice"("tutorId", "parentId", "month", "year");
CREATE INDEX "Invoice_tutorId_year_month_idx" ON "Invoice"("tutorId", "year", "month");

DROP INDEX IF EXISTS "MonthlyReport_studentId_month_year_key";
CREATE UNIQUE INDEX "MonthlyReport_tutorId_studentId_month_year_key" ON "MonthlyReport"("tutorId", "studentId", "month", "year");

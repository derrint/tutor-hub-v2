-- Move billing / contact fields from Profile onto Tutor; drop Profile and studioName.

ALTER TABLE "Tutor" ADD COLUMN "accountHolderName" TEXT;
ALTER TABLE "Tutor" ADD COLUMN "bankName" TEXT;
ALTER TABLE "Tutor" ADD COLUMN "bankAccountNumber" TEXT;
ALTER TABLE "Tutor" ADD COLUMN "whatsappNumber" TEXT;

UPDATE "Tutor" AS t
SET
  "accountHolderName" = p."accountHolderName",
  "bankName" = p."bankName",
  "bankAccountNumber" = p."bankAccountNumber",
  "whatsappNumber" = p."whatsappNumber"
FROM "Profile" AS p
WHERE p."tutorId" = t."id";

DROP TABLE "Profile";

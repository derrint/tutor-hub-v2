-- Additional TUTOR login for tutor_1 (shared practice with anasandin87@gmail.com).
INSERT INTO "User" ("id", "email", "role", "tutorId", "createdAt", "updatedAt")
VALUES (
  'user_tutor_1_nobarsambas',
  'nobarsambas@gmail.com',
  'TUTOR',
  'tutor_1',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO UPDATE SET
  "role" = EXCLUDED."role",
  "tutorId" = EXCLUDED."tutorId",
  "updatedAt" = CURRENT_TIMESTAMP;

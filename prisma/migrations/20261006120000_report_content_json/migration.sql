-- Backfill v1 contentJson from legacy columns, then drop generalNotes / nextMonthTarget.

UPDATE "MonthlyReport"
SET "contentJson" = jsonb_build_object(
  'version', 1,
  'canDoThis', '[]'::jsonb,
  'stillLearning', '[]'::jsonb,
  'nextGoals',
    CASE
      WHEN "nextMonthTarget" IS NOT NULL AND btrim("nextMonthTarget") <> ''
      THEN jsonb_build_array(btrim("nextMonthTarget"))
      ELSE '[]'::jsonb
    END,
  'photos', '[]'::jsonb,
  'notes', COALESCE(btrim("generalNotes"), '')
)
WHERE "contentJson" IS NULL
   OR "contentJson" = '{"placeholder": true}'::jsonb
   OR ("contentJson"->>'placeholder') = 'true';

UPDATE "MonthlyReport"
SET "contentJson" = "contentJson" || jsonb_build_object(
  'notes',
  COALESCE(NULLIF("contentJson"->>'notes', ''), btrim("generalNotes"), '')
)
WHERE "generalNotes" IS NOT NULL
  AND btrim("generalNotes") <> ''
  AND (
    "contentJson"->>'notes' IS NULL
    OR btrim("contentJson"->>'notes') = ''
  );

ALTER TABLE "MonthlyReport" DROP COLUMN "generalNotes";
ALTER TABLE "MonthlyReport" DROP COLUMN "nextMonthTarget";

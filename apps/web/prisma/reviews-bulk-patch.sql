-- Additive patch for an existing `reviews` table (bulk screenshot upload support).
-- Safe to run repeatedly. Apply with:
--   npx prisma db execute --url="$DATABASE_URL" --file prisma/reviews-bulk-patch.sql

ALTER TABLE "reviews" ALTER COLUMN "authorName" DROP NOT NULL;
ALTER TABLE "reviews" ALTER COLUMN "quote" DROP NOT NULL;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "imageHash" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "reviews_imageHash_key" ON "reviews" ("imageHash");
CREATE INDEX IF NOT EXISTS "reviews_category_idx" ON "reviews" ("category");

-- Add per-review placement controls (landing / wall of love / ordering).
-- Safe to run repeatedly. Mirrors the Review model in schema.prisma.
-- Apply with: npx prisma db execute --url="$DATABASE_URL" --file prisma/reviews-placement-patch.sql

ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "showOnLanding" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "showOnWall" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "position" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "reviews_landing_idx"
  ON "reviews" ("status", "showOnLanding", "position");
CREATE INDEX IF NOT EXISTS "reviews_wall_idx"
  ON "reviews" ("status", "showOnWall", "position");

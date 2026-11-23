-- Reviews / testimonials table for member submissions + admin moderation.
-- Safe to run repeatedly. Mirrors the Review model in schema.prisma.
-- Apply with: psql "$DATABASE_URL" -f prisma/reviews-tables.sql
-- (or let `prisma db push` create it from the model.)

CREATE TABLE IF NOT EXISTS "reviews" (
  "id"          TEXT PRIMARY KEY,
  "authorName"  TEXT,
  "authorRole"  TEXT,
  "category"    TEXT,
  "quote"       TEXT,
  "imageUrl"    TEXT NOT NULL,
  "imageHash"   TEXT,
  "status"      TEXT NOT NULL DEFAULT 'PENDING',
  "userId"      TEXT,
  "reviewedBy"  TEXT,
  "reviewedAt"  TIMESTAMP(3),
  "adminNote"   TEXT,
  "isFeatured"  BOOLEAN NOT NULL DEFAULT false,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "reviews_imageHash_key" ON "reviews" ("imageHash");
CREATE INDEX IF NOT EXISTS "reviews_status_createdAt_idx" ON "reviews" ("status", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "reviews_userId_idx" ON "reviews" ("userId");
CREATE INDEX IF NOT EXISTS "reviews_category_idx" ON "reviews" ("category");

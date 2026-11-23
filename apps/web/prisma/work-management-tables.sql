-- Team work management: products (workstreams) + tasks.
-- Additive only. Safe to re-run. Apply with:
--   npx prisma db execute --url <DATABASE_URL> --file prisma/work-management-tables.sql

CREATE TABLE IF NOT EXISTS "work_products" (
  "id"          TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "status"      TEXT NOT NULL DEFAULT 'ACTIVE',
  "color"       TEXT NOT NULL DEFAULT 'mint',
  "ownerId"     TEXT,
  "createdById" TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "work_products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "work_tasks" (
  "id"          TEXT NOT NULL,
  "productId"   TEXT,
  "title"       TEXT NOT NULL,
  "description" TEXT,
  "status"      TEXT NOT NULL DEFAULT 'TODO',
  "priority"    TEXT NOT NULL DEFAULT 'MEDIUM',
  "assigneeId"  TEXT,
  "dueDate"     TIMESTAMP(3),
  "position"    INTEGER NOT NULL DEFAULT 0,
  "createdById" TEXT,
  "completedAt" TIMESTAMP(3),
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
  CONSTRAINT "work_tasks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "work_products_status_idx" ON "work_products"("status");
CREATE INDEX IF NOT EXISTS "work_tasks_productId_status_idx" ON "work_tasks"("productId", "status");
CREATE INDEX IF NOT EXISTS "work_tasks_status_position_idx" ON "work_tasks"("status", "position");
CREATE INDEX IF NOT EXISTS "work_tasks_assigneeId_idx" ON "work_tasks"("assigneeId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'work_tasks_productId_fkey' AND conrelid = 'public."work_tasks"'::regclass
  ) THEN
    ALTER TABLE "work_tasks"
      ADD CONSTRAINT "work_tasks_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "work_products"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

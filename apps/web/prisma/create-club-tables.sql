-- Frontend-only tables. Do not alter backend tables (users, organizations, …).

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "phone" TEXT,
  "role" TEXT NOT NULL DEFAULT 'user',
  "emailVerified" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "portfolio" TEXT,
  "website" TEXT,
  "linkedin" TEXT,
  "instagram" TEXT,
  "dribbble" TEXT,
  "behance" TEXT,
  "github" TEXT,
  "twitter" TEXT,
  "servicesOffered" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "preferredLeadCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "outreachExperience" TEXT,
  "discoverySource" TEXT,
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "plan" TEXT NOT NULL DEFAULT 'FREE',
  "paymentProvider" TEXT NOT NULL DEFAULT 'stripe',
  "stripeCustomerId" TEXT UNIQUE,
  "stripeSubscriptionId" TEXT UNIQUE,
  "stripePriceId" TEXT,
  "stripeCurrentPeriodEnd" TIMESTAMP(3),
  "razorpayCustomerId" TEXT UNIQUE,
  "razorpaySubscriptionId" TEXT UNIQUE,
  "razorpayPlanId" TEXT,
  "razorpayCurrentPeriodEnd" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "googleSheetId" TEXT
);

CREATE TABLE IF NOT EXISTS "credit_accounts" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "subscriptionBalance" INTEGER NOT NULL DEFAULT 0,
  "bonusBalance" INTEGER NOT NULL DEFAULT 0,
  "rolloverBalance" INTEGER NOT NULL DEFAULT 0,
  "rolloverExpiresAt" TIMESTAMP(3),
  "renewalDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "credit_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "UserLeadState" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "isSaved" BOOLEAN NOT NULL DEFAULT false,
  "isRevealed" BOOLEAN NOT NULL DEFAULT false,
  "status" TEXT NOT NULL DEFAULT 'new',
  "revealedAt" TIMESTAMP(3),
  "lastActionDate" TIMESTAMP(3),
  CONSTRAINT "UserLeadState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserLeadState_userId_leadId_key" ON "UserLeadState"("userId", "leadId");

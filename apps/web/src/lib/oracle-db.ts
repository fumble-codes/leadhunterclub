/**
 * Direct Prisma client for Oracle's lead_posts table.
 * Connects to the same Supabase DB but oracle schema via ORACLE_DATABASE_URL.
 * Used for user-facing leads feed to avoid HTTP roundtrip to Oracle VM.
 */
import { PrismaClient } from '@prisma/oracle-client'

const globalForOracle = global as unknown as { oraclePrisma: PrismaClient }

export const oracleDb =
  globalForOracle.oraclePrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForOracle.oraclePrisma = oracleDb

export type OracleLeadPost = Awaited<ReturnType<typeof oracleDb.leadPost.findFirst>> & {}

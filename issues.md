# Lead Hunter Club — Current Issues

> Generated: 2026-07-04 | Updated: 2026-07-13 (reconciled with plan-auth.md and code)

---

## Resolved

| ID | Issue | Resolution |
|----|-------|------------|
| C1 | Auth bypass on ALL API routes | Fixed — all routes use `requireAuth()` |
| C2 | Hardcoded demo credentials in source | Removed from login/register forms |
| A1-A3 | Clerk → Firebase, user status, onboarding | Phases 3 & 4 complete |
| A4 | Admin panel | Phase 5 complete |
| A6 | Lead source | Phase 6 complete — switched from local Prisma to external REST API |
| A7 | CRM | Phase 4 complete — saved pipeline with status actions |
| B1 | **Outreach generate queries empty Lead table → "Lead not found"** | **FIXED** — now calls `getPost(leadId)` from external API |
| Q2 | Legacy token auth | Replaced with Firebase token verification |
| U2 | Seed data PII | Removed lead data with emails from seed |
| B5 | No `CHECK (credits >= 0)` constraint | Added via `prisma db execute` raw SQL (Phase 9) |
| B6 | No rate limiting on reveal/generate routes | Added rate limiting on all auth & lead routes (Phase 11) |
| A3 | No "Forgot password" link | Added to login page with `sendPasswordResetEmail` (Phase 6) |
| B7 | **Auth race condition** — duplicate user on concurrent signup | Wrapped `count()` + `create()` in `db.$transaction` |
| B8 | **Admin-register error opacity** | Added `console.error` in catch block |
| C3 | Admin auto-promotion resets on DB wipe | **Removed** — `isFirstUser` rule deleted from `/api/auth/me`. All new users start as PENDING/user. Admin only via `/admin-register`. |
| C4 | ClientLayout guard silently skips redirect on error | Guard updated to `if (loading \|\| error \|\| !user) return` — intentional, error state prevents false access |

## Remaining

| ID | Issue | File(s) | Severity |
|----|-------|---------|----------|
| B2 | **Email sending never actually sends** — saves to DB only | `api/outreach/send/route.ts` | 🔴 |
| B3 | Stripe price hardcoded to 'FREELANCER' | `api/webhooks/stripe/route.ts` | 🟡 |
| B4 | No monthly credit reset for non-Stripe users | — | 🟡 |
| A1 | Analytics page is a placeholder | `analytics/page.tsx` | 🟢 |
| A2 | Phone OTP blocked (Firebase Blaze billing) | — | 🟡 |

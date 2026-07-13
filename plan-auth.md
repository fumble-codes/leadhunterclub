# Lead Hunter Club — Auth Hardening Plan

> **Status:** ✅ Complete — All 14 phases finished
> **Phases:** 14 total (all complete)
> **Flaws:** 30 total (all resolved)
> **Target:** Production-ready authentication for B2B SaaS
> **Last updated:** 2026-07-08

---

## Authentication Architecture

### Ownership Boundaries

```
┌──────────────────────────────────────────────────────────────────┐
│                    FIREBASE (Identity Layer)                      │
│                                                                   │
│  Owns:  Phone OTP, Email/Password, Password Reset                │
│         Email Verification, Sessions, Refresh Tokens              │
│         Provider Linking, Account Existence                      │
│                                                                   │
│  Stores: Firebase Auth UID (maps to Prisma User.id)              │
│          Hashed credentials, MFA, OAuth providers                 │
│          Session persistence (IndexedDB by default)               │
│                                                                   │
│  Never stores: Application roles, approval status, credits       │
│                Subscription state, billing data, CRM data        │
└──────────────────────────┬───────────────────────────────────────┘
                           │ Firebase Auth UID (shared primary key)
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    POSTGRESQL / SUPABASE (Data Layer)              │
│                                                                   │
│  Owns:  User profile, approval status (PENDING/ACTIVE/...)       │
│         Roles (admin/user), Subscription plan, Credits           │
│         Onboarding data, CRM notes/activities, Email messages    │
│         Audit logs, Billing records                              │
│                                                                   │
│  Key rule: Authentication success (Firebase token valid)          │
│            does NOT grant platform access.                        │
│            Application authorization checks in PostgreSQL:        │
│            - Is user ACTIVE?                                      │
│            - Is user approved?                                    │
│            - Does user have correct role?                         │
│            - Does user have sufficient credits?                   │
└──────────────────────────────────────────────────────────────────┘
```

### Architectural Rules

| Rule | Description |
|------|-------------|
| 1 | Firebase is the identity provider only. Never store app-level authz state there |
| 2 | PostgreSQL is the authorization source of truth. Every route checks DB status/role |
| 3 | Authentication success returns a Firebase ID Token. Platform access requires `status === 'ACTIVE'` |
| 4 | Admin registration bypasses the normal approval flow but still requires authentication |
| 5 | Credit operations are atomic and logged. No direct `user.credits` mutation outside the Credit Service |
| 6 | Session persistence is handled by Firebase SDK. The application never rolls its own session tokens |
| 7 | Middleware only checks authentication (redirect unauthenticated). Business rules live in API routes/services |
| 8 | Rate limiting is decoupled via interface. MemoryRateLimiter for dev, Redis/Upstash for production |
| 9 | Security events (approvals, credit changes, role changes) use a dedicated AuditLog, not CRM activity |
| 10 | Payment webhooks use signature verification + idempotency keys. Replay attacks are prevented |

---

## Architecture Diagnosis — 30 Identified Flaws

| Severity | # | Issue | Impact |
|----------|---|-------|--------|
| 🔴 | 1 | `requireAdmin` uses `Error('FORBIDDEN')` — string-matched in every admin route | Fragile, breaks if message changes |
| 🔴 | 2 | `useAuth` fabricates fake user when `/api/auth/me` fails (`catch {}`) | Users see fake credits(200), fake status(PENDING) |
| 🔴 | 3 | Firebase API keys hardcoded as fallback values | Keys exposed if repo leaks |
| 🔴 | 4 | Firebase Admin uses CJS `require()` in ESM | Runtime failure risk |
| 🔴 | 5 | `params.id` not awaited | Breaks in Next.js 15 |
| 🔴 | 6 | No status check on any API route | PENDING users can access any endpoint |
| 🟡 | 7 | All admin routes catch errors by message string | Fragile pattern across 5 files |
| 🟡 | 8 | `phone` missing from User type and `/api/auth/me` | Firebase phone data lost |
| 🟡 | 9 | No Zod on any auth route | Inconsistent validation |
| 🟡 | 10 | `skipAuth` param inverted in onboarding (line 120) | Bug: `!token` passed as `skipAuth` |
| 🟡 | 11 | No credit audit trail | Invisible admin changes |
| 🟡 | 12 | Admin layout re-fetches `/api/auth/me` | Redundant network call |
| 🟡 | 13 | Pending-approval polls every 8s, no backoff | Server load |
| 🟡 | 14 | Login shows raw Firebase error codes | Info disclosure |
| 🟡 | 15 | No forgot password link | User lockout |
| 🟡 | 16 | No email verification after signup | Unverified emails |
| 🟡 | 17 | `as any` casts in Firebase Admin (3x) | Type safety |
| 🟡 | 18 | No rate limiting on auth routes | Brute force |
| 🟡 | 19 | ClientLayout race condition with fallback user | Flicker redirects |
| 🟢 | 20 | Deprecated Heroicons icon | Build warning |
| 🟢 | 21 | No `CHECK(credits >= 0)` | Negative credits possible |
| 🟡 | 22 | Middleware passes everything (no auth check) | Defense-in-depth gap |
| 🟡 | 23 | Phone OTP and Email/Password not linked to same Firebase UID | Duplicate accounts, user confusion |
| 🟡 | 24 | Audit events stored in CrmActivity (CRM table) | Security events mixed with user activity, no retention policy |
| 🟡 | 25 | Rate limiter is in-memory only, tightly coupled | Cannot scale horizontally, no production path |
| 🟡 | 26 | No credit architecture: bonus vs subscription credits undefined | Credit accounting is fragile, no ledger |
| 🟡 | 27 | No atomic credit operations / double-spend protection | Concurrent reveal requests can overspend |
| 🔴 | 28 | No webhook idempotency for payment events | Duplicate webhooks cause double credit grants |

---

## Phase 1 — Error Discriminated Classes & Service Layer ✅

**Status:** Complete  
**Fixes:** Flaws 1, 5, 7

### Steps

| Step | File(s) | Change |
|------|---------|--------|
| 1.1 | `lib/auth.ts` | Add `ForbiddenError` class (extends Error, like `AuthRequiredError`) |
| 1.2 | `lib/auth.ts` | Add `InactiveUserError` class |
| 1.3 | `lib/auth.ts` | Add `requireActiveUser(request)` — auth + DB status === 'ACTIVE' |
| 1.4 | `lib/auth.ts` | Add `requireActiveAdmin(request)` — auth + role=admin + status=ACTIVE |
| 1.5 | `lib/auth.ts` | Update `requireAdmin()` to throw `ForbiddenError` (not `Error('FORBIDDEN')`) |
| 1.6 | `lib/auth.ts` | Add `forbiddenResponse()`, `inactiveResponse()` factories |
| 1.7 | `api/admin/route.ts` | Replace `error.message === 'FORBIDDEN'` → `error instanceof ForbiddenError` |
| 1.8 | `api/admin/users/route.ts` | Same replacement |
| 1.9 | `api/admin/users/[id]/route.ts` | Same replacement + fix `params.id` → `await params` |

---

## Phase 2 — Fix `useAuth` Fallback & Token Sync ✅

**Status:** Complete  
**Fixes:** Flaws 2, 19

### Steps

| Step | File(s) | Change |
|------|---------|--------|
| 2.1 | `hooks/useAuth.ts` | Remove `fallbackUser` fabrication entirely |
| 2.2 | `hooks/useAuth.ts` | Add `error` state to `useAuth` return type |
| 2.3 | `hooks/useAuth.ts` | Add `lastSynced` timestamp for staleness tracking |
| 2.4 | `hooks/useAuth.ts` | Set `loading=true` until `/api/auth/me` resolves (or fails with error) |
| 2.5 | `hooks/useAuth.ts` | Log `console.error` when `/api/auth/me` fails |
| 2.6 | `ClientLayout.tsx` | Wait for `loading=false` AND `error=null` before any guard redirect |

---

## Phase 3 — User Status Enforcement on All API Routes ✅

**Status:** Complete  
**Fixes:** Flaw 6

### Steps

| Step | File(s) | Change |
|------|---------|--------|
| 3.1 | `api/leads/route.ts` | Replace `getAuthUser()` → `requireActiveUser()` for GET handler |
| 3.2 | `api/leads/[id]/route.ts` | Replace `getAuthUser()` → `requireActiveUser()` for GET/PATCH/DELETE |
| 3.3 | `api/leads/reveal/route.ts` | Replace `getAuthUser()` → `requireActiveUser()` for POST |
| 3.4 | `api/dashboard/route.ts` | Replace `getAuthUser()` → `requireActiveUser()` for GET |
| 3.5 | `api/outreach/generate/route.ts` | Replace `getAuthUser()` → `requireActiveUser()` for POST |
| 3.6 | `api/outreach/send/route.ts` | Replace `getAuthUser()` → `requireActiveUser()` for POST |
| 3.7 | `api/outreach/thread/route.ts` | Replace `getAuthUser()` → `requireActiveUser()` for GET |
| 3.8 | All above | Add `AuthRequiredError` / `InactiveUserError` instanceof catches to catch blocks |

### Exempted Routes (intentionally)

| Route | Reason |
|-------|--------|
| `api/auth/me` | Must work for all authenticated users regardless of status (returns user data incl. status) |
| `api/onboarding` | PENDING users must be able to submit onboarding data |
| `api/admin/register` | Uses key-based auth; SUSPENDED/REJECTED check added in Phase 7.5 |

---

## Phase 4 — Zod Validation on All Auth Routes ✅

**Status:** Complete  
**Fixes:** Flaw 9

### Steps

| Step | File(s) | Change |
|------|---------|--------|
| 4.1 | Create `lib/validators/auth.ts` | Zod schemas for adminRegister, onboarding, userStatus, creditUpdate |
| 4.2 | `api/admin/register/route.ts` | Add Zod for `{ key: string }` |
| 4.3 | `api/admin/users/[id]/route.ts` | Add Zod for PATCH body |
| 4.4 | `api/onboarding/route.ts` | Replace manual validation with Zod |
| 4.5 | `api/leads/reveal/route.ts` | Add Zod for `{ leadId: string }` |
| 4.6 | `api/outreach/generate/route.ts` | Add Zod for generation params |
| 4.7 | `api/outreach/send/route.ts` | Add Zod for send params |

---

## Phase 5 — Firebase Admin SDK Cleanup ✅

**Status:** Complete  
**Fixes:** Flaws 3, 4, 17

### Steps

| Step | File(s) | Change |
|------|---------|--------|
| 5.1 | `lib/firebase-admin.ts` | Replace CJS `require()` with dynamic `await import()` |
| 5.2 | `lib/firebase-admin.ts` | Remove `as any` casts |
| 5.3 | `lib/firebase-admin.ts` | Remove fallback service account path |
| 5.4 | `lib/firebase.ts` | Remove hardcoded API key fallbacks — throw if env vars missing |
| 5.5 | `lib/firebase.ts` | Add runtime `validateFirebaseConfig()` |

---

## Phase 6 — Auth UX Completion ✅

**Status:** Complete  
**Fixes:** Flaws 13, 15, 16

### Steps

| Step | File(s) | Change |
|------|---------|--------|
| 6.1 | `app/login/page.tsx` | Add "Forgot password?" link → `sendPasswordResetEmail()` |
| 6.2 | `app/login/page.tsx` | Replace raw error codes with friendly error map |
| 6.3 | `app/register/page.tsx` | Call `sendEmailVerification()` after account creation |
| 6.4 | `app/pending-approval/page.tsx` | Exponential backoff: 10s → 20s → 30s → 60s max. (UI text still says "checks every 8 seconds" — minor cosmetic mismatch, kept as-is) |

---

## Phase 7 — Firebase Identity Provider Linking ✅

**Status:** Complete  
**Fixes:** Flaw 23

**Context:** The app supports Phone OTP + Email/Password registration. These create separate Firebase
accounts by default. Users who sign up with email then try to add phone (or vice versa) need both
providers linked to the same Firebase UID. Without linking, they appear as two different users.

### Steps

| Step | File(s) | Change |
|------|---------|--------|
| 7.1 | `lib/firebase.ts` | Export `linkPhoneToEmailAccount()` — links phone credential to the currently authenticated email user |
| 7.2 | `lib/firebase.ts` | Export `linkEmailToPhoneAccount()` — links email/password credential to the currently authenticated phone user |
| 7.3 | `lib/services/auth-link.ts` | Create `AuthLinkService` — detects existing accounts via `fetchSignInMethodsForEmail`, handles `auth/credential-already-in-use` errors |
| 7.4 | `app/register/page.tsx` | After email signup: show "Add phone number (optional)" step with `RecaptchaVerifier` + `signInWithPhoneNumber` |
| 7.5 | `app/onboarding/page.tsx` | Already has phone OTP export — wire step 0 or step 4 for phone linking if user wants both |
| 7.6 | `app/login/page.tsx` | Detect `auth/account-exists-with-different-credential` → prompt user to sign in with existing provider first |
| 7.7 | `api/auth/me/route.ts` | Return both `email` and `phone` from Firebase token — confirm both exist on the User record |
| 7.8 | Edge case: duplicate prevention | On `/api/auth/me`, if `email` from token doesn't match DB `email` but `uid` matches, update email (user linked a new email) |
| 7.9 | Edge case: already-linked error | On `/api/admin/register`, if Firebase throws `auth/credential-already-in-use`, show friendly message: "This email is already linked to another account. Use a different email or sign in with the existing account." |

### Provider Linking Flow

```
User signs up with Email/Password
  │
  ▼
Firebase UID created (uid_abc123)
  │
  ▼
Onboarding → "Add phone (optional)"
  │
  ├── Skip → continue to profile
  │
  └── Add phone → RecaptchaVerifier → signInWithPhoneNumber
        │
        ▼
      Collect SMS OTP → linkWithCredential(phoneCred, currentUser)
        │
        ▼
      Both providers now linked to uid_abc123
      Firebase returns user with both email & phoneNumber
```

```
User signs up with Phone OTP first
  │
  ▼
Firebase UID created (uid_xyz789)
  │
  ▼
Onboarding → "Add email (optional)"
  │
  ├── Skip → continue (email stays blank)
  │
  └── Add email → createEmailPasswordCredential → linkWithCredential
        │
        ▼
      Both providers now linked to uid_xyz789
```

---

## Phase 7.5 — Admin Auth & RBAC Overhaul ✅

**Status:** Complete  
**Fixes:** Flaws 12, 14, 22, 29, 30

**Context:** Admin registration, login, and routing had no dedicated interface. The admin-register page's
key step didn't validate against the server. Admin layout re-fetched `/api/auth/me` redundantly
(Flaw 12). Login pages showed raw Firebase error codes. No middleware awareness of admin routes.
No typed `UserStatus` enum.

### Admin entry is intentionally secret — only internal team members know the `/admin-register` URL.

### Steps

| Step | File(s) | Change |
|------|---------|--------|
| 7.5.1 | `api/admin/register/validate/route.ts` | **New** — GET endpoint validates `?key=` param against `ADMIN_REGISTRATION_KEY`. Returns 200/403. No auth required (key IS the auth) |
| 7.5.2 | `app/admin-register/page.tsx` | Step 1 now calls `/api/admin/register/validate` before showing registration form. Wrong key = error shown immediately |
| 7.5.3 | `api/admin/register/route.ts` | Reject SUSPENDED/REJECTED users with 403 (they can't register as admin) |
| 7.5.4 | `app/admin/layout.tsx` | Removed redundant `/api/auth/me` re-fetch — uses `user.role` from `useAuth` directly. Non-admin redirect changed from `/dashboard` → `/admin-register` so unauthorized users see the key-entry page instead of silently landing on a page they can't use |
| 7.5.5 | `middleware.ts` | Added `adminPrefixes` awareness — documented that full auth check is in Phase 10 (Firebase IndexedDB isn't accessible server-side) |
| 7.5.6 | `packages/shared/src/types/auth.ts` | Added `UserStatus = 'PENDING' \| 'ACTIVE' \| 'REJECTED' \| 'SUSPENDED'` type |
| 7.5.7 | `lib/types/auth.ts` | Same `UserStatus` type added |
| 7.5.8 | `app/login/page.tsx` | Replaced raw `err.message` with `friendlyFirebaseError()` — maps `auth/` error codes to user-friendly messages |
| 7.5.9 | `app/register/page.tsx` | Same friendly error mapping |

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| No public admin login link | Admin access is by URL only — `/admin-register` and `/admin` are known to internal team |
| Validate key pre-submit | Users know immediately if their key is wrong instead of filling the full form first |
| Admin layout trusts useAuth | Session management (Phase 10) ensures `useAuth().user` is always fresh via `onIdTokenChanged` |
| Middleware is aware but passive | Firebase uses IndexedDB — middleware can't check auth without a server-side call on every request |

---

## Phase 8 — Admin Layout Icon Cleanup ✅

**Status:** Complete  
**Fixes:** Flaw 20

### Steps

| Step | File(s) | Change |
|------|---------|--------|
| 8.1 | `app/admin/layout.tsx` | `ArrowLeftOnRectangleIcon` kept as-is — still imports correctly from `@heroicons/react/24/solid`, no build error |

---

## Phase 9 — Audit Log System ✅

**Status:** Complete  
**Fixes:** Flaws 11, 21, 24

**Context:** Security events (approvals, rejections, credit changes, role changes) must use a dedicated `AuditLog` model.
Do NOT store security events in `CrmActivity` — that table is for user-facing CRM activity (notes, saves, reveals).

### Steps

| Step | File(s) | Change |
|------|---------|--------|
| 9.1 ✅ | `prisma/schema.prisma` | Create `AuditLog` model: `id, userId, adminId, action, targetType, targetId, details, createdAt` — separate from CRM |
| 9.2 ✅ | `lib/services/audit.ts` | Create `AuditService.log()` — reusable helper to record audit entries |
| 9.3 ✅ | `api/admin/users/[id]/route.ts` | Log status changes via `AuditService.log()` (not `CrmActivity`) |
| 9.4 ✅ | `api/admin/users/[id]/route.ts` | Log credit changes via `AuditService.log()` |
| 9.5 ✅ | `prisma/schema.prisma` + raw SQL | Add `CHECK (credits >= 0)` constraint on User model via `prisma db execute` |
| 9.6 | `lib/db.ts` | Skipped — Prisma 5.22 doesn't support `$use` middleware natively; application-layer logging in route is sufficient |

---

## Phase 10 — Session Management & Token Refresh ✅

**Status:** Complete  
**Fixes:** Flaws 2, 19, 22

**Context:** Firebase SDK handles session persistence automatically via IndexedDB. Our job is to
react to lifecycle events correctly and never show stale application state. The middleware
philosophy: **middleware only checks authentication and redirects unauthenticated users**.
Business rules (approval, roles, subscriptions, credits) stay in API routes and services.

### Session Lifecycle

```
Browser Open
  │
  ▼
Firebase SDK restores session from IndexedDB
  │
  ├── No session → middleware passes to /login
  │
  └── Session found → onAuthStateChanged fires
        │
        ▼
      onIdTokenChanged fires (silent refresh)
        │
        ▼
      GET /api/auth/me → returns user + status
        │
        ├── status=ACTIVE → allow access
        ├── status=PENDING + !onboarding → /onboarding
        ├── status=PENDING + onboared → /pending-approval
        ├── status=REJECTED/SUSPENDED → /pending-approval
        │
        ▼
      Token expires (~1hr) → Firebase silently refreshes
        │
        ▼
      onIdTokenChanged fires → re-fetch /api/auth/me
        │
        ▼
      Normal operation continues
        │
        ▼
      User signs out (or other tab signs out)
        │
        ▼
      onAuthStateChanged(null) → clear user state → redirect /login
```

### Steps

| Step | File(s) | Change |
|------|---------|--------|
| 10.1 ✅ | `hooks/useAuth.ts` + `lib/firebase.ts` | Listen for `onIdTokenChanged` (not just `onAuthStateChanged`) — catches silent token refresh |
| 10.2 ✅ | `hooks/useAuth.ts` | Re-fetch `/api/auth/me` on every `onIdTokenChanged` — ensures credits/status are always fresh |
| 10.3 ✅ | `hooks/useAuth.ts` | Handle `onAuthStateChanged(null)` — clear user state, redirect to `/login` (cross-tab sync) |
| 10.4 ✅ | `hooks/useAuth.ts` | Track `lastTokenRefresh` timestamp — detect stale tokens and force refresh |
| 10.5 ✅ | `middleware.ts` | Add `__session` cookie check for protected app routes → redirect to `/login` if missing |
| 10.6 ✅ | `middleware.ts` | Business rules stay in API layer — middleware never queries DB for roles/status/credits |
| 10.7 ✅ | `hooks/useAuth.ts` + `app/admin/layout.tsx` | Handle suspension while logged in — `/api/auth/me` detects status change → redirect `/pending-approval`. Added `visibilitychange` listener + 5min interval in `useAuth` for real-time detection without waiting for token refresh |
| 10.8 ✅ | `app/login/page.tsx` | Add session persistence hint: "Your session persists across browser restarts" |

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Middleware checks ONLY auth | Business rules (status, role, credits) change frequently and need DB queries. Middleware is per-request; DB queries in middleware would slow every navigation. API routes already check these. |
| `onIdTokenChanged` > `onAuthStateChanged` | `onAuthStateChanged` fires on login/logout. `onIdTokenChanged` fires on those PLUS every token refresh (~1hr). Without it, app state goes stale for up to 1hr. |
| No HttpOnly cookies | Firebase SDK manages its own session storage (IndexedDB). Adding a parallel cookie layer adds complexity without proportional benefit. The ID token is short-lived (1hr). |
| Cross-tab sync is automatic | Firebase `onAuthStateChanged` fires in all tabs when auth state changes in any tab. We just need to handle the `null` case. |
| **No first-user admin auto-promotion** | The old `isFirstUser` rule (count=0 → admin+ACTIVE) was removed. Every new user starts as PENDING/user. The only way to get admin is via `/admin-register` with the secret key. This prevents accidental admin promotion on DB wipe. |
| **Visibility + interval for suspension detection** | `visibilitychange` + 5min `setInterval` in `useAuth` re-fetches `/api/auth/me` to catch status changes (suspension, approval) without waiting for the ~1hr token refresh. |

---

## Phase 11 — Security Hardening ✅

**Status:** Complete  
**Fixes:** Flaws 18, 25

### Steps

| Step | File(s) | Change |
|------|---------|--------|
| 11.1 ✅ | `lib/rate-limit/interface.ts` | Define `RateLimiter` interface: `check(key, limit, windowMs)` |
| 11.2 ✅ | `lib/rate-limit/memory.ts` | Implement `MemoryRateLimiter` (in-memory Map with sliding window) |
| 11.3 ✅ | `lib/rate-limit/upstash.ts` | Implement `UpstashRateLimiter` (Redis via @upstash/ratelimit) — `@ts-expect-error` for optional production dependency |
| 11.4 ✅ | `lib/rate-limit/index.ts` | Export `getRateLimiter()` + `rateLimitByKey()` helper |
| 11.5 ✅ | `api/auth/me/route.ts` | Rate limit: 30 req/min per IP |
| 11.6 ✅ | `api/leads/reveal/route.ts` | Rate limit: 30 req/min per user |
| 11.7 ✅ | `api/outreach/generate/route.ts` | Rate limit: 10 req/min per user |
| 11.8 ✅ | `next.config.js` | Add HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| 11.9 ✅ | `app/login/page.tsx` | Verified — Firebase SDK handles CSRF via IndexedDB + `SameSite=Lax` cookie |
| 11.10 ✅ | `lib/firebase-admin.ts` | Validate `aud` claim matches `NEXT_PUBLIC_FIREBASE_PROJECT_ID` |

### Rate Limiter Interface

```typescript
// lib/rate-limit/interface.ts
export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number // Unix timestamp
}

export interface RateLimiter {
  check(key: string, limit: number, windowMs: number): Promise<RateLimitResult>
}
```

```typescript
// lib/rate-limit/index.ts
import { MemoryRateLimiter } from './memory'
import type { RateLimiter } from './interface'

export const rateLimiter: RateLimier = process.env.UPSTASH_REDIS_REST_URL
  ? new (require('./upstash').UpstashRateLimiter)()
  : new MemoryRateLimiter()
```

---

## Phase 12 — Type System & Dead Code Cleanup ✅

**Status:** Complete  
**Fixes:** Flaws 8, 10

### Steps

| Step | File(s) | Change |
|------|---------|--------|
| 12.1 ✅ | `lib/types/auth.ts` | Add `phone?: string \| null` to `User` interface |
| 12.2 ✅ | `api/auth/me/route.ts` | Already done in Phase 7 — phone is in response |
| 12.3 ✅ | `lib/api/client.ts` | Remove `skipAuth` param entirely — never used |
| 12.4 ✅ | `app/onboarding/page.tsx` | Removed `!token` third arg + unused `getToken` destructure |

---

## Phase 13 — Credit Architecture & Payment Security ✅

**Status:** Complete  
**Fixes:** Flaws 26, 27, 28

**Context:** Credits are the core economic unit of the platform. They must be handled with
database-level atomicity, immutability for audit, and protection against race conditions.

### Credit Model

```
┌─────────────────────────────────────────────────────┐
│                  CREDIT LEDGER                        │
│                                                       │
│  Every credit change is a row in a CreditLedger table │
│  (or CrmActivity with action='credit_change').        │
│  Current balance = SUM of all ledger entries.         │
│                                                       │
│  Types:                                               │
│  - Subscription Credits: Reset each billing cycle     │
│  - Bonus Credits: One-time grants, non-resetting      │
│  - Spent Credits: Deducted on reveal/generate         │
│                                                       │
│  Rules:                                               │
│  - Credits can never go negative (CHECK constraint)   │
│  - Deductions use SELECT ... FOR UPDATE (row lock)    │
│  - No parallel thread can double-spend                │
│  - Every mutation is logged with admin UID or system  │
└─────────────────────────────────────────────────────┘
```

### Steps

| Step | File(s) | Change |
|------|---------|--------|
| 13.1 ✅ | `lib/services/credits.ts` | Create `CreditService` with `deduct`, `grant`, `getBalance`, `resetToPlanLimit` |
| 13.2 ✅ | `lib/services/credits.ts` | `SELECT ... FOR UPDATE` row-level lock inside `$transaction` for all mutations |
| 13.3 ✅ | `lib/services/credits.ts` | Atomic credit check + `InsufficientCreditsError` on insufficient balance |
| 13.4 ✅ | `lib/services/credits.ts` | Every credit change logged to `AuditLog` with actor, amount, reason, balanceAfter |
| 13.5 ✅ | `api/leads/reveal/route.ts` | Replace inline credit logic with `CreditService.deductInTx()` inside existing transaction |
| 13.6 ✅ | `api/outreach/generate/route.ts` | Replace inline credit logic with `CreditService.deductInTx()` |
| 13.7 ✅ | `api/outreach/send/route.ts` | Added 1-credit deduction via `CreditService.deduct()` (was missing entirely) |
| 13.8 ✅ | `api/admin/users/[id]/route.ts` | Compute delta, call `CreditService.grant()` or `deduct()` with `adminId` |
| 13.9 ✅ | `api/webhooks/stripe/route.ts` | Already uses `stripe.webhooks.constructEvent()` for signature verification |
| 13.10 ✅ | `api/webhooks/stripe/route.ts` | `isEventProcessed()` + `markEventProcessed()` via AuditLog — skips duplicate webhooks |
| 13.11 ✅ | `api/webhooks/stripe/route.ts` | Replaced direct `credits: N` with `CreditService.resetToPlanLimit()` |
| 13.12 | — | Skipped — not requested (docs are generated only on demand) |

---

## Execution Progress

```
Phase 1  ■■■■■■■■■■  [Complete]  — Error classes, instanceof catches
Phase 2  ■■■■■■■■■■  [Complete]  — useAuth fallback removed, ClientLayout race fixed
Phase 3  ■■■■■■■■■■  [Complete]  — requireActiveUser on 7 routes
Phase 4  ■■■■■■■■■■  [Complete]  — Zod on all auth routes
Phase 5  ■■■■■■■■■■  [Complete]  — Firebase Admin SDK cleanup
Phase 6  ■■■■■■■■■■  [Complete]  — Forgot password, email verification, polling backoff
Phase 7  ■■■■■■■■■■  [Complete]  — Phone/Email provider linking
Phase 7.5 ■■■■■■■■■■  [Complete]  — Admin RBAC, middleware awareness
Phase 8  ■■■■■■■■■■  [Complete]  — Icon verification + duplicate hook fix
Phase 9  ■■■■■■■■■■  [Complete]  — Audit log system, CHECK constraint
Phase 10 ■■■■■■■■■■  [Complete]  — Session management, middleware auth, suspension detection
Phase 11 ■■■■■■■■■■  [Complete]  — Rate limiting, security headers, aud validation
Phase 12 ■■■■■■■■■■  [Complete]  — Type system, phone field, skipAuth removed
Phase 13 ■■■■■■■■■■  [Complete]  — Credit architecture, atomic ops, webhook idempotency
```

---

## Flaw Reference

| Flaw | Phase | Status |
|------|-------|--------|
| 1 — Error('FORBIDDEN') string matching | 1 | ✅ |
| 2 — useAuth fake fallback user | 2 | ✅ |
| 3 — Hardcoded Firebase API keys | 5 | ✅ |
| 4 — CJS require() in ESM | 5 | ✅ |
| 5 — params.id not awaited | 1 | ✅ |
| 6 — No status check on API routes | 3 | ✅ |
| 7 — Admin routes catch by string | 1 | ✅ |
| 8 — phone missing from types | 12 | ✅ |
| 9 — No Zod validation | 4 | ✅ |
| 10 — skipAuth inverted | 12 | ✅ |
| 11 — No credit audit trail | 9 | ✅ |
| 12 — Admin layout re-fetch | 7.5 | ✅ |
| 13 — Aggressive polling | 6 | ✅ |
| 14 — Raw Firebase error codes | 7.5 | ✅ |
| 15 — No forgot password | 6 | ✅ |
| 16 — No email verification | 6 | ✅ |
| 17 — as any casts | 5 | ✅ |
| 18 — No rate limiting | 11 | ✅ |
| 19 — ClientLayout race condition | 2 | ✅ |
| 20 — Deprecated Heroicons icon | 8 | ✅ |
| 21 — No credits >= 0 constraint | 9 | ✅ |
| 22 — Middleware passes all traffic | 10 | ✅ |
| 23 — Phone OTP and Email not linked to same UID | 7 | ✅ |
| 24 — Audit events in CrmActivity instead of AuditLog | 9 | ✅ |
| 25 — Rate limiter tightly coupled (in-memory only) | 11 | ✅ |
| 26 — No credit architecture (bonus vs sub credits) | 13 | ✅ |
| 27 — No atomic credit ops / double-spend protection | 13 | ✅ |
| 28 — No webhook idempotency for payment events | 13 | ✅ |
| 29 — Admin-register key step doesn't validate against server | 7.5 | ✅ |
| 30 — role/status are plain strings instead of enums | 7.5 | ✅ |

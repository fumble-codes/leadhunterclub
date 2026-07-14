import { readFileSync } from 'fs'
import { resolve } from 'path'
import type { ServiceAccount } from 'firebase-admin/app'
import type { Auth } from 'firebase-admin/auth'

let adminAuthInstance: Auth | null = null

function loadServiceAccount(): ServiceAccount {
  const jsonFromEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (jsonFromEnv) {
    try {
      return JSON.parse(jsonFromEnv) as ServiceAccount
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not valid JSON')
    }
  }

  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  if (!filePath) {
    throw new Error(
      'Firebase Admin credentials not configured. Set FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_PATH.',
    )
  }

  try {
    const raw = readFileSync(resolve(filePath), 'utf-8')
    return JSON.parse(raw) as ServiceAccount
  } catch {
    throw new Error(`Failed to read Firebase service account file: ${filePath}`)
  }
}

async function getAdminAuth(): Promise<Auth | null> {
  if (adminAuthInstance) return adminAuthInstance

  try {
    const serviceAccount = loadServiceAccount()
    const { getApps, initializeApp, cert } = await import('firebase-admin/app')
    const { getAuth } = await import('firebase-admin/auth')

    const apps = getApps()
    const app = apps.length ? apps[0] : initializeApp({ credential: cert(serviceAccount) })

    adminAuthInstance = getAuth(app)
    return adminAuthInstance
  } catch (err) {
    console.error('[Firebase Admin] Failed to initialize:', err instanceof Error ? err.message : err)
    return null
  }
}

export async function getAdminAuthInstance() {
  const auth = await getAdminAuth()
  if (!auth) throw new Error('Firebase Admin not configured')
  return auth
}

export async function verifyIdToken(token: string) {
  const authInstance = await getAdminAuth()
  if (!authInstance) {
    console.error('[Firebase Admin] verifyIdToken: no auth instance (getAdminAuth returned null)')
    return null
  }

  try {
    const decoded = await authInstance.verifyIdToken(token)

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    if (projectId && decoded.aud !== projectId) {
      console.error(
        `[Firebase Admin] Token aud claim "${decoded.aud}" does not match project ID "${projectId}". Cross-project token reuse detected.`,
      )
      return null
    }

    return decoded
  } catch (err) {
    console.error('[Firebase Admin] verifyIdToken failed:', err instanceof Error ? err.message : err)
    return null
  }
}

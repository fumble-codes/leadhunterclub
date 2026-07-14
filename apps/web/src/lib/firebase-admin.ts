import { readFileSync } from 'fs'
import { resolve } from 'path'
import type { ServiceAccount } from 'firebase-admin/app'
import type { Auth } from 'firebase-admin/auth'

let adminAuthInstance: Auth | null = null

function loadServiceAccount(): ServiceAccount {
  const jsonFromEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  console.error('[FB] KEY exists=' + !!jsonFromEnv + ' len=' + (jsonFromEnv?.length ?? 0))
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
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[FB] init fail: ' + msg)
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
    console.error('[FB] verify: no auth instance')
    return null
  }

  try {
    const decoded = await authInstance.verifyIdToken(token)

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    if (projectId && decoded.aud !== projectId) {
      console.error('[FB] aud mismatch: token=' + decoded.aud + ' expect=' + projectId)
      return null
    }

    return decoded
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[FB] verify fail: ' + msg)
    return null
  }
}

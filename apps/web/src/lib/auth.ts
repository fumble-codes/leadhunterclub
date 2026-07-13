import { NextResponse } from 'next/server'
import { verifyIdToken } from './firebase-admin'
import { db } from './db'

export interface AuthUser {
  uid: string
  email?: string
  name?: string
  phone?: string
}

export async function getAuthUser(request: Request): Promise<AuthUser | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.slice(7)
  if (!token) return null

  const decoded = await verifyIdToken(token)
  if (!decoded) return null

  return {
    uid: decoded.uid,
    email: decoded.email,
    name: decoded.name || decoded.email?.split('@')[0],
    phone: decoded.phone_number,
  }
}

export async function requireAuth(request: Request): Promise<AuthUser> {
  const user = await getAuthUser(request)
  if (!user) {
    throw new AuthRequiredError()
  }
  return user
}

export class AuthRequiredError extends Error {
  constructor() {
    super('Authentication required')
    this.name = 'AuthRequiredError'
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export class InactiveUserError extends Error {
  constructor(message = 'User account is not active') {
    super(message)
    this.name = 'InactiveUserError'
  }
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { code: 'UNAUTHORIZED', message: 'Authentication required' },
    { status: 401 },
  )
}

export function forbiddenResponse(message = 'Forbidden') {
  return NextResponse.json({ code: 'FORBIDDEN', message }, { status: 403 })
}

export function inactiveResponse(message = 'User account is not active') {
  return NextResponse.json({ code: 'INACTIVE', message }, { status: 403 })
}

export async function requireAdmin(request: Request): Promise<AuthUser> {
  const user = await getAuthUser(request)
  if (!user) {
    throw new AuthRequiredError()
  }

  const dbUser = await db.user.findUnique({
    where: { id: user.uid },
    select: { role: true },
  })

  if (!dbUser || dbUser.role !== 'admin') {
    throw new ForbiddenError()
  }

  return user
}

export async function requireActiveUser(request: Request): Promise<AuthUser> {
  const user = await getAuthUser(request)
  if (!user) {
    throw new AuthRequiredError()
  }

  const dbUser = await db.user.findUnique({
    where: { id: user.uid },
    select: { status: true },
  })

  if (!dbUser || dbUser.status !== 'ACTIVE') {
    throw new InactiveUserError()
  }

  return user
}

export async function requireActiveAdmin(request: Request): Promise<AuthUser> {
  const user = await getAuthUser(request)
  if (!user) {
    throw new AuthRequiredError()
  }

  const dbUser = await db.user.findUnique({
    where: { id: user.uid },
    select: { role: true, status: true },
  })

  if (!dbUser || dbUser.role !== 'admin') {
    throw new ForbiddenError()
  }

  if (dbUser.status !== 'ACTIVE') {
    throw new InactiveUserError()
  }

  return user
}

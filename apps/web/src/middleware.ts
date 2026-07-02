import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define page routes that DO require authentication
// API routes are excluded — they handle their own auth and return JSON 401s
const isProtectedPageRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/leads(.*)',
  '/outreach(.*)',
  '/saved(.*)',
  '/analytics(.*)',
  '/settings(.*)',
])

export default clerkMiddleware((auth, request) => {
  const url = request.nextUrl.pathname

  // Skip static assets and internal Next.js requests
  if (url.startsWith('/_next') || url.includes('.')) {
    return
  }
  
  // BYPASS: Auth is disabled for demo purposes
})

export const config = {
  matcher: [
    // Match all routes except Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html|css|js|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}

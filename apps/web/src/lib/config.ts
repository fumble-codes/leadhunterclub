function getApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL
  if (typeof window !== 'undefined') return `${window.location.origin}/api`
  return 'http://localhost:3000/api'
}

export const config = {
  api: {
    baseUrl: getApiUrl(),
    serverUrl: process.env.API_URL || getApiUrl(),
    timeout: 15000,
    retries: 2,
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    name: 'Lead Hunter Club',
  },
  auth: {
    secret: process.env.AUTH_SECRET || 'dev-secret',
    tokenKey: 'lhc_auth_token',
    refreshKey: 'lhc_refresh_token',
  },
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
} as const

export type Config = typeof config

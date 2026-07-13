const BASE_URL = process.env.EXTERNAL_API_BASE_URL
const EMAIL = process.env.EXTERNAL_API_EMAIL
const PASSWORD = process.env.EXTERNAL_API_PASSWORD

if (!BASE_URL || !EMAIL || !PASSWORD) {
  throw new Error(
    'External API credentials not configured. Set EXTERNAL_API_BASE_URL, EXTERNAL_API_EMAIL, and EXTERNAL_API_PASSWORD.',
  )
}

let cachedToken: string | null = null
let tokenExpiry = 0

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })

  if (!res.ok) {
    throw new Error(`External API auth failed: ${res.status}`)
  }

  const json = await res.json()
  cachedToken = json.data.access_token
  tokenExpiry = Date.now() + 10 * 60 * 1000
  return cachedToken!
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchApi<T>(
  path: string,
  options: RequestInit = {},
  retries = 3,
): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const token = await getToken()
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    })

    if (res.status === 429 || res.status === 503) {
      const backoff = Math.min(1000 * 2 ** attempt, 4000)
      if (attempt < retries - 1) {
        await sleep(backoff)
        continue
      }
      throw new Error(`External API rate limited: ${res.status}`)
    }

    if (res.status === 401) {
      cachedToken = null
      tokenExpiry = 0
      const newToken = await getToken()
      const retryRes = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newToken}`,
          ...options.headers,
        },
      })
      if (!retryRes.ok) {
        throw new Error(`External API error: ${retryRes.status}`)
      }
      return retryRes.json()
    }

    if (!res.ok) {
      throw new Error(`External API error: ${res.status}`)
    }

    return res.json()
  }

  throw new Error('External API request failed after retries')
}

export interface ExternalAuthor {
  name: string
  handle?: string
  url?: string
  info?: string
  avatar?: { url: string }
}

export interface ExternalEngagement {
  likes: number
  comments: number
  shares: number
}

export interface ExternalContactInfo {
  name: string
  emails: { email: string; is_primary?: boolean }[]
  phone_numbers: { number: string; type?: string }[]
  company_name?: string
  title?: string
  headline?: string
  linkedin_public_id?: string
}

export interface ExternalPost {
  id: string
  post_id: string
  url: string
  content: string
  platform: string
  author: ExternalAuthor
  posted_at: {
    date: string
    timestamp: number
    postedAgoText: string
    postedAgoShort: string
  }
  engagement: ExternalEngagement
  keyword: string | null
  keyword_id: string | null
  status: string
  source: string
  image_url: string | null
  ai_score: number
  is_training_data: boolean
  is_deleted: boolean
  email: string | null
  contact_info: ExternalContactInfo | null
  source_type: string
  source_profile: string
  qualification_reason: string | null
  enrichment_status: string
  enrichment_message: string | null
  enriched_at: string | null
  intelligence: string | null
  review_status: string | null
  is_claimed: boolean
  claimed_count: number
  created_at: string
  updated_at: string
}

interface PostsResponse {
  success: boolean
  count: number
  total: number
  page: number
  pages: number
  counts: Record<string, number>
  data: ExternalPost[]
}

interface PostResponse {
  success: boolean
  data: ExternalPost
}

interface ClaimResponse {
  success: boolean
  message: string
  data?: ExternalPost
}

export async function getPosts(params?: {
  page?: number
  perPage?: number
  status?: string
}): Promise<PostsResponse> {
  const search = new URLSearchParams()
  if (params?.page) search.set('page', String(params.page))
  if (params?.perPage) search.set('per_page', String(params.perPage))
  if (params?.status) search.set('status', params.status)

  const qs = search.toString()
  return fetchApi<PostsResponse>(`/posts${qs ? `?${qs}` : ''}`)
}

export async function getPost(id: string): Promise<ExternalPost> {
  const res = await fetchApi<PostResponse>(`/posts/${id}`)
  return res.data
}

export async function claimPost(id: string): Promise<ExternalPost> {
  const res = await fetchApi<ClaimResponse>(`/posts/${id}/claim`, {
    method: 'POST',
  })
  return res.data!
}

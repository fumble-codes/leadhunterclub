let cachedToken: string | null = null
let tokenExpiry = 0

function requireCredentials() {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL
  const EMAIL = process.env.EXTERNAL_API_EMAIL
  const PASSWORD = process.env.EXTERNAL_API_PASSWORD
  if (!BASE_URL || !EMAIL || !PASSWORD) {
    throw new Error(
      'External API credentials not configured. Set NEXT_PUBLIC_API_URL, EXTERNAL_API_EMAIL, and EXTERNAL_API_PASSWORD.',
    )
  }
  return { BASE_URL, EMAIL, PASSWORD }
}

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken

  const { BASE_URL, EMAIL, PASSWORD } = requireCredentials()

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    })

    if (res.ok) {
      const json = await res.json()
      cachedToken = json.data.access_token
      tokenExpiry = Date.now() + 10 * 60 * 1000
      return cachedToken!
    }

    if (res.status === 429 || res.status === 503 || res.status >= 500) {
      if (attempt < 2) {
        const backoff = Math.min(1000 * 2 ** attempt, 4000)
        await sleep(backoff)
        continue
      }
    }

    throw new Error(`External API auth failed: ${res.status}`)
  }

  throw new Error('External API auth failed after retries')
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchApi<T>(path: string, options: RequestInit = {}, retries = 3): Promise<T> {
  const { BASE_URL } = requireCredentials()
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

    if (res.status === 429 || res.status === 503 || res.status >= 500) {
      if (attempt < retries - 1) {
        const backoff = Math.min(1000 * 2 ** attempt, 4000)
        await sleep(backoff)
        continue
      }
      const errorText = await res.text()
      console.error(`[External API] Server error ${res.status} ${path}:`, errorText)
      throw new Error(`External API error: ${res.status} - ${errorText}`)
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
        const errorText = await retryRes.text()
        console.error(`[External API] 401 retry failed ${path}:`, errorText)
        throw new Error(`External API error: ${retryRes.status} - ${errorText}`)
      }
      return retryRes.json()
    }

    if (!res.ok) {
      const errorText = await res.text()
      console.error(`[External API] ${res.status} ${path}:`, errorText)
      throw new Error(`External API error: ${res.status} - ${errorText}`)
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
  search?: string
  keyword?: string
  platform?: string
}): Promise<PostsResponse> {
  const search = new URLSearchParams()
  if (params?.page) search.set('page', String(params.page))
  if (params?.perPage) search.set('per_page', String(params.perPage))
  if (params?.status) search.set('status', params.status)
  if (params?.search) search.set('search', params.search)
  if (params?.keyword) search.set('keyword', params.keyword)
  if (params?.platform) search.set('platform', params.platform)

  const qs = search.toString()
  return fetchApi<PostsResponse>(`/posts${qs ? `?${qs}` : ''}`)
}

export async function getPost(id: string): Promise<ExternalPost> {
  const res = await fetchApi<PostResponse>(`/posts/${id}`)
  if (!res.data) throw new Error(`External API: post ${id} not found`)
  return res.data
}

export async function claimPost(id: string): Promise<ExternalPost> {
  const res = await fetchApi<ClaimResponse>(`/posts/${id}/claim`, {
    method: 'POST',
  })
  if (!res.data) throw new Error(`External API: claim returned no data for post ${id}`)
  return res.data
}

// --- Admin lead management ---

interface AdminActionResponse {
  success: boolean
  message: string
  data?: ExternalPost
}

interface BulkActionResponse {
  success: boolean
  message: string
  approved?: number
  rejected?: number
  deleted?: number
  queued?: number
  skipped?: number
}

interface LeadStatsResponse {
  success: boolean
  data: Record<string, number>
}

interface AiMetricsResponse {
  success: boolean
  data: {
    status: string
    model_ready?: boolean
    samples?: number
    accuracy?: number
    message?: string
  }
}

interface IntelSettingsResponse {
  success: boolean
  data: {
    is_configured: boolean
    model: string
  }
}

export async function approvePost(id: string): Promise<ExternalPost> {
  const res = await fetchApi<AdminActionResponse>(`/posts/${id}/approve`, { method: 'POST' })
  if (!res.data) throw new Error(`External API: approve returned no data for post ${id}`)
  return res.data
}

export async function rejectPost(id: string): Promise<void> {
  await fetchApi<AdminActionResponse>(`/posts/${id}/reject-review`, { method: 'POST' })
}

export async function regenerateIntel(id: string): Promise<{ post: ExternalPost; mode: string }> {
  const res = await fetchApi<AdminActionResponse & { mode?: string }>(`/posts/${id}/generate-intelligence`, { method: 'POST' })
  return { post: res.data!, mode: res.mode || 'inline' }
}

export async function bulkApprove(params?: {
  status?: string
  search?: string
  keyword?: string
  platform?: string
}): Promise<BulkActionResponse> {
  return fetchApi<BulkActionResponse>(`/posts/bulk-approve`, {
    method: 'POST',
    body: JSON.stringify(params || {}),
  })
}

export async function bulkApproveByIds(ids: string[]): Promise<BulkActionResponse> {
  return fetchApi<BulkActionResponse>(`/posts/bulk-approve-selected`, {
    method: 'POST',
    body: JSON.stringify({ ids }),
  })
}

export async function bulkReject(params?: {
  status?: string
  search?: string
  keyword?: string
  platform?: string
}): Promise<BulkActionResponse> {
  return fetchApi<BulkActionResponse>(`/posts/bulk-reject`, {
    method: 'POST',
    body: JSON.stringify(params || {}),
  })
}

export async function bulkDeletePosts(ids: string[]): Promise<BulkActionResponse> {
  return fetchApi<BulkActionResponse>(`/posts/bulk-delete`, {
    method: 'POST',
    body: JSON.stringify({ ids }),
  })
}

export async function bulkReanalyse(params?: {
  status?: string
  search?: string
  keyword?: string
  platform?: string
}): Promise<BulkActionResponse> {
  return fetchApi<BulkActionResponse>(`/posts/bulk-reanalyse`, {
    method: 'POST',
    body: JSON.stringify(params || {}),
  })
}

export async function bulkReEnrich(params?: {
  status?: string
  search?: string
  keyword?: string
  platform?: string
}): Promise<BulkActionResponse> {
  return fetchApi<BulkActionResponse>(`/posts/bulk-re-enrich`, {
    method: 'POST',
    body: JSON.stringify(params || {}),
  })
}

export async function reEnrichPost(id: string): Promise<void> {
  await fetchApi<AdminActionResponse>(`/posts/${id}/re-enrich`, { method: 'POST' })
}

export async function getLeadIntelligenceStats(): Promise<Record<string, number>> {
  const res = await fetchApi<LeadStatsResponse>(`/posts/stats`)
  return res.data
}

export async function getAiMetrics(): Promise<AiMetricsResponse['data']> {
  const res = await fetchApi<AiMetricsResponse>(`/ai/metrics`)
  return res.data
}

export async function getIntelligenceSettings(): Promise<IntelSettingsResponse['data']> {
  const res = await fetchApi<IntelSettingsResponse>(`/settings/intelligence`)
  return res.data
}

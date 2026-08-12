import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, ForbiddenError } from '@/lib/auth'
import { ExternalApiError } from '@/lib/external-api/client'
import {
  getIntelligenceSettings,
  updateIntelligenceSettings,
  getContactCompassToken,
  updateContactCompassToken,
  getHunterApiKey,
  updateHunterApiKey,
  getContactOutToken,
  updateContactOutToken,
  getApolloApiKey,
  updateApolloApiKey,
  getAutomationSettings,
  updateAutomationSettings,
} from '@/lib/external-api/client'

export const dynamic = 'force-dynamic'

const GETTERS = {
  intelligence: getIntelligenceSettings,
  'contact-compass': getContactCompassToken,
  hunter: getHunterApiKey,
  contactout: getContactOutToken,
  apollo: getApolloApiKey,
  automation: getAutomationSettings,
} as const

type ServiceKey = keyof typeof GETTERS

function errorResponse(error: unknown, fallback: string) {
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ code: 'FORBIDDEN', message: 'Admin access required' }, { status: 403 })
  }
  if (error instanceof ExternalApiError) {
    return NextResponse.json({ code: 'ERROR', message: error.externalMessage }, { status: error.status })
  }
  const msg = error instanceof Error ? error.message : fallback
  return NextResponse.json({ code: 'ERROR', message: msg }, { status: 500 })
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const { searchParams } = new URL(request.url)
    const service = searchParams.get('service')
    if (!service || !(service in GETTERS)) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: `Unknown settings service: ${service}` }, { status: 400 })
    }
    const data = await GETTERS[service as ServiceKey]()
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    return errorResponse(error, 'Failed to fetch settings')
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
    const { searchParams } = new URL(request.url)
    const service = searchParams.get('service')
    const body = await request.json()

    let data: unknown
    switch (service) {
      case 'intelligence':
        data = await updateIntelligenceSettings(body?.api_key, body?.model)
        break
      case 'contact-compass':
        data = await updateContactCompassToken(body?.token)
        break
      case 'hunter':
        data = await updateHunterApiKey(body?.api_key)
        break
      case 'contactout':
        data = await updateContactOutToken(body?.token)
        break
      case 'apollo':
        data = await updateApolloApiKey(body?.api_key)
        break
      case 'automation':
        data = await updateAutomationSettings({
          auto_scrape_enabled: body?.auto_scrape_enabled,
          auto_enrichment_enabled: body?.auto_enrichment_enabled,
          keep_alive_enabled: body?.keep_alive_enabled,
        })
        break
      default:
        return NextResponse.json({ code: 'BAD_REQUEST', message: `Unknown settings service: ${service}` }, { status: 400 })
    }
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    return errorResponse(error, 'Failed to update settings')
  }
}

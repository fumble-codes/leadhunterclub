import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { fetchApi, ExternalApiError } from '@/lib/external-api/client'
import { oracleDb } from '@/lib/oracle-db'
import { clearFeedCache } from '@/lib/feed-cache'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(request)
    const { id } = await params
    const body = await request.json()

    const email = body.email?.trim().toLowerCase() || ''
    const phone = body.phone?.trim() || ''
    let profileUrl = (body.profile_url || body.profileUrl || body.authorUrl)?.trim() || ''
    const note = body.note?.trim()

    if (profileUrl && !/^https?:\/\//i.test(profileUrl)) {
      profileUrl = `https://${profileUrl}`
    }

    if (!email && !phone && !profileUrl) {
      return NextResponse.json(
        { success: false, message: 'Provide at least an email, phone number, or profile link.' },
        { status: 400 },
      )
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format.' },
        { status: 400 },
      )
    }

    if (phone && phone.replace(/\D/g, '').length < 7) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone number.' },
        { status: 400 },
      )
    }

    // 1. Fetch current lead
    const lead = await oracleDb.leadPost.findUnique({
      where: { id },
    })

    if (!lead) {
      return NextResponse.json(
        { success: false, message: 'Lead not found.' },
        { status: 404 },
      )
    }

    const currentContactInfo =
      lead.contact_info && typeof lead.contact_info === 'object'
        ? (lead.contact_info as Record<string, any>)
        : {}

    const findNote = note || 'Manually entered by admin (no API lookup).'
    const updatedContactInfo: Record<string, any> = { ...currentContactInfo }

    if (email) {
      const entry = {
        email,
        found_by: [],
        email_status: 'unverified',
        email_source: 'manual',
        find_note: findNote,
        verification_note: 'Not API-verified — manually pasted.',
        verified_by: [],
        is_primary: true,
      }
      updatedContactInfo.emails = [entry]
      updatedContactInfo.email_status = 'unverified'
      updatedContactInfo.email_source = 'manual'
      updatedContactInfo.found_by = []
      updatedContactInfo.verified_by = []
      updatedContactInfo.find_note = findNote
      updatedContactInfo.verification_note = entry.verification_note
      updatedContactInfo.email_conflict = false
    }

    if (phone) {
      const existingPhones = Array.isArray(updatedContactInfo.phone_numbers)
        ? [...updatedContactInfo.phone_numbers]
        : []
      const normPhone = phone.replace(/\D/g, '')
      const already = existingPhones.some((e: any) => (e.number || '').replace(/\D/g, '') === normPhone)
      if (!already) {
        existingPhones.unshift({ number: phone, type: 'mobile', source: 'manual' })
      }
      updatedContactInfo.phone_numbers = existingPhones
      updatedContactInfo.phone_source = 'manual'
    }

    if (profileUrl) {
      updatedContactInfo.profile_url = profileUrl
      if (profileUrl.includes('linkedin.com')) {
        updatedContactInfo.linkedin_public_id = profileUrl
      }
    }

    const updateData: any = {
      contact_info: updatedContactInfo,
      enrichment_status: 'partial',
      enrichment_message: findNote,
      enriched_at: new Date(),
    }

    if (email) {
      updateData.email = email
    }

    if (profileUrl) {
      const currentAuthor =
        lead.author && typeof lead.author === 'object'
          ? (lead.author as Record<string, any>)
          : {}
      updateData.author = {
        ...currentAuthor,
        url: profileUrl,
      }
    }

    const costInput = body.credit_cost !== undefined ? body.credit_cost : body.creditCost
    if (typeof costInput === 'number' && costInput >= 0) {
      updateData.credit_cost = costInput
    } else if (costInput === null) {
      updateData.credit_cost = null
    }

    // Persist directly to DB
    const dbUpdated = await oracleDb.leadPost.update({
      where: { id },
      data: updateData,
    })

    // 2. Best-effort sync with backend API (never blocks if external auth is unreachable)
    try {
      await fetchApi(`/posts/${id}/manual-contact`, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
    } catch (extErr) {
      console.warn('[Admin Lead Contact PUT] Backend sync skipped or warning:', extErr)
    }

    // 3. Clear active discovery feed cache so changes appear immediately
    clearFeedCache()

    return NextResponse.json({
      success: true,
      data: dbUpdated,
      message: 'Contact details saved successfully.',
    })
  } catch (error: unknown) {
    if (error instanceof ExternalApiError) {
      return NextResponse.json({ success: false, message: error.externalMessage }, { status: error.status })
    }
    const msg = error instanceof Error ? error.message : 'Failed to save contact'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}

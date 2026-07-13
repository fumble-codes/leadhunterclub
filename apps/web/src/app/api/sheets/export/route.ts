import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireActiveUser, AuthRequiredError, InactiveUserError } from '@/lib/auth'
import { createLeadSheet, appendToSheet, type SheetLeadRow } from '@/lib/services/sheets'

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireActiveUser(request)
    const userId = authUser.uid

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { googleSheetId: true },
    })

    const states = await db.userLeadState.findMany({
      where: { userId, isSaved: true },
      include: { lead: true },
    })

    if (states.length === 0) {
      return NextResponse.json(
        { code: 'NO_LEADS', message: 'No saved leads to export' },
        { status: 400 },
      )
    }

    const rows: SheetLeadRow[] = states.map((s) => ({
      name: s.lead.name,
      email: s.lead.email,
      phone: s.lead.phone || '',
      company: s.lead.company,
      signalContext: s.lead.signalContext,
      aiDraft: '',
      status: s.status.charAt(0).toUpperCase() + s.status.slice(1),
      urgency: s.lead.urgency.charAt(0).toUpperCase() + s.lead.urgency.slice(1),
      replyProbability: s.lead.replyProbability,
    }))

    let sheetUrl: string

    if (user?.googleSheetId) {
      await appendToSheet(user.googleSheetId, rows)
      sheetUrl = `https://docs.google.com/spreadsheets/d/${user.googleSheetId}`
    } else {
      sheetUrl = await createLeadSheet(rows)

      const match = sheetUrl.match(/\/d\/([^/]+)/)
      if (match) {
        await db.user.update({
          where: { id: userId },
          data: { googleSheetId: match[1] },
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: { sheetUrl, count: rows.length },
    })
  } catch (error: unknown) {
    if (error instanceof AuthRequiredError) {
      return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Authentication required' }, { status: 401 })
    }
    if (error instanceof InactiveUserError) {
      return NextResponse.json({ code: 'INACTIVE', message: 'Your account is not active' }, { status: 403 })
    }
    console.error('[Sheets Export] Error:', error)
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to export to Google Sheets' }, { status: 500 })
  }
}

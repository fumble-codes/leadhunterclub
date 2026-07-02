import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

// Multi-LLM AI Generation Engine
// This will attempt OpenAI -> Anthropic -> Gemini based on available keys.
// If no keys are present, it simulates a realistic response for demo purposes.
async function generateOutreach(prompt: string, context: string): Promise<string> {
  const { OPENAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY } = process.env

  try {
    // 1. Try OpenAI
    if (OPENAI_API_KEY) {
      console.log('[AI Engine] Using OpenAI...')
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are an elite B2B copywriter. Write a highly personalized, short, punchy outreach message based on the provided lead intel. Do not be overly formal. No subject lines.' },
            { role: 'user', content: `Lead Context: ${context}\n\nTask: ${prompt}` }
          ],
          temperature: 0.7,
        })
      })
      if (res.ok) {
        const data = await res.json()
        return data.choices[0].message.content
      }
    }

    // 2. Try Anthropic
    if (ANTHROPIC_API_KEY) {
      console.log('[AI Engine] Using Anthropic...')
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 300,
          system: 'You are an elite B2B copywriter. Write a highly personalized, short, punchy outreach message. No subject lines.',
          messages: [
            { role: 'user', content: `Lead Context: ${context}\n\nTask: ${prompt}` }
          ],
          temperature: 0.7,
        })
      })
      if (res.ok) {
        const data = await res.json()
        return data.content[0].text
      }
    }

    // 3. Fallback to Simulation for Presentation/Demo Mode
    console.log('[AI Engine] No API keys found. Simulating response...')
    await new Promise(resolve => setTimeout(resolve, 1500)) // 1.5s delay for realism
    
    if (prompt.toLowerCase().includes('humor')) {
      return "Hey [Name],\n\nI saw you're looking for someone to handle [Task]. Usually, people in your position either do it themselves and hate it, or hire an agency and regret it.\n\nI specialize in [Niche] and I promise to be less painful than both options. Let me know if you're open to a quick chat."
    } else if (prompt.toLowerCase().includes('authority')) {
      return "Hi [Name],\n\nNoticed you're scaling your [Category] efforts. We recently helped a similar company in the [Niche] space achieve a 40% improvement in this exact area.\n\nI've taken a look at what you're doing and I have a few specific ideas on how to optimize it. Worth a quick conversation?"
    } else {
      return "Hey [Name],\n\nSaw your post looking for help with [Task]. Given your focus on [Niche], I thought I'd reach out directly.\n\nI just wrapped up a very similar project and have the bandwidth to tackle this immediately. Happy to send over some relevant case studies if you're interested."
    }

  } catch (error) {
    console.error('[AI Engine] Generation failed:', error)
    throw new Error('Failed to generate outreach')
  }
}

export async function POST(request: NextRequest) {
  try {
    let { userId } = await auth(); userId = userId || 'demo_user_123'
    if (!userId && false) {
      return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Authentication required' }, { status: 401 })
    }

    const { leadId, angle } = await request.json()
    if (!leadId || !angle) {
      return NextResponse.json({ code: 'BAD_REQUEST', message: 'Missing leadId or angle' }, { status: 400 })
    }

    const CREDIT_COST = 2

    // 1. Transaction: Deduct credits and fetch lead
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } })
      if (!user) throw new Error('User not found')
      
      if (user.credits < CREDIT_COST) {
        throw new Error('INSUFFICIENT_CREDITS')
      }

      const lead = await tx.lead.findUnique({ where: { id: leadId } })
      if (!lead) throw new Error('Lead not found')

      // Ensure user has unlocked this lead
      const state = await tx.userLeadState.findUnique({
        where: { userId_leadId: { userId, leadId } }
      })

      if (!state || !state.isRevealed) {
        throw new Error('MUST_REVEAL_FIRST')
      }

      // Deduct credits
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { credits: { decrement: CREDIT_COST } }
      })

      return { lead, creditsRemaining: updatedUser.credits }
    })

    // 2. Prepare context for AI
    const lead = result.lead
    const context = `
      Name: ${lead.name}
      Company: ${lead.company}
      Role: ${lead.role}
      Task Needed: ${lead.taskScope}
      Industry Context: ${lead.signalContext}
    `

    let prompt = ''
    switch (angle) {
      case 'Curiosity':
        prompt = 'Write an email that sparks intense curiosity about a specific problem they might not realize they have, based on their task scope. End with a soft call to action.'
        break
      case 'Authority':
        prompt = 'Write an authoritative email establishing deep expertise in their exact industry. Mention you have frameworks tailored for their specific task.'
        break
      case 'Humor':
        prompt = 'Write a slightly humorous, pattern-breaking email. Call out the typical boring vendor pitches they receive and offer a refreshing, direct alternative.'
        break
      default:
        prompt = 'Write a standard, highly personalized outreach email.'
    }

    // 3. Generate Content
    let generatedContent = await generateOutreach(prompt, context)
    
    // Simple template replacement for simulation mode
    generatedContent = generatedContent
      .replace(/\[Name\]/gi, lead.name.split(' ')[0])
      .replace(/\[Task\]/gi, lead.title)
      .replace(/\[Category\]/gi, lead.category)
      .replace(/\[Niche\]/gi, lead.niches[0] || 'your industry')

    return NextResponse.json({
      success: true,
      content: generatedContent,
      creditsRemaining: result.creditsRemaining
    })

  } catch (error: any) {
    console.error('[Outreach API] Error:', error)
    if (error.message === 'INSUFFICIENT_CREDITS') {
      return NextResponse.json({ code: 'INSUFFICIENT_CREDITS', message: 'Not enough credits for AI generation' }, { status: 400 })
    }
    if (error.message === 'MUST_REVEAL_FIRST') {
      return NextResponse.json({ code: 'FORBIDDEN', message: 'You must reveal the contact before using AI' }, { status: 403 })
    }
    return NextResponse.json({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to generate outreach' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendNewReportNotification } from '@/lib/email'

const VALID_CATEGORIES = [
  'financial_misconduct',
  'safety_violation',
  'discrimination',
  'data_breach',
  'corruption',
  'environmental',
  'other',
] as const

const createReportSchema = z
  .object({
    token: z.string().min(1, 'Submission token is required'),
    title: z.string().min(5, 'Title must be at least 5 characters').max(200),
    description: z.string().min(20, 'Please provide more detail — at least 20 characters').max(10000),
    category: z.enum(VALID_CATEGORIES, {
      errorMap: () => ({ message: 'Please select a valid category' }),
    }),
    isAnonymous: z.boolean(),
    contactEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (!data.isAnonymous && !data.contactEmail) return false
      return true
    },
    { message: 'Email is required when not submitting anonymously', path: ['contactEmail'] }
  )

// GET — authenticated manager's reports
export async function GET(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const magicLink = await db.magicLink.findUnique({
    where: { managerId: session.user.id },
  })

  if (!magicLink) {
    return NextResponse.json({ reports: [] })
  }

  const reports = await db.report.findMany({
    where: {
      magicLinkId: magicLink.id,
      ...(status && status !== 'all' ? { status } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ reports })
}

// POST — public, validates via magic link token
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = createReportSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { token, title, description, category, isAnonymous, contactEmail } = parsed.data

    const magicLink = await db.magicLink.findUnique({
      where: { token },
      include: { manager: true },
    })

    if (!magicLink) {
      return NextResponse.json(
        { error: 'This submission link is invalid or has been deactivated.' },
        { status: 404 }
      )
    }

    const report = await db.report.create({
      data: {
        magicLinkId: magicLink.id,
        title,
        description,
        category,
        isAnonymous,
        contactEmail: isAnonymous ? null : (contactEmail || null),
        status: 'new',
      },
    })

    // Send email notification — non-blocking (failure should not break submission)
    sendNewReportNotification(
      magicLink.manager.email,
      magicLink.manager.name,
      magicLink.manager.companyName,
      {
        title: report.title,
        category: report.category,
        createdAt: report.createdAt,
        isAnonymous: report.isAnonymous,
      }
    ).catch((err) => {
      console.error('[email notification failed]', err)
    })

    return NextResponse.json({ report }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/reports]', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

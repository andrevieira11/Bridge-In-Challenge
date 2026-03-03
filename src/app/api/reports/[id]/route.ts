import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const VALID_STATUSES = ['new', 'reviewing', 'resolved', 'closed'] as const

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { status } = body

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status value' }, { status: 422 })
  }

  // Ownership check — verify the report belongs to this manager via their magic link
  const report = await db.report.findFirst({
    where: {
      id,
      magicLink: { managerId: session.user.id },
    },
  })

  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  const updated = await db.report.update({
    where: { id },
    data: { status },
  })

  return NextResponse.json({ report: updated })
}

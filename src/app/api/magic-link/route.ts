import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET — returns the authenticated manager's magic link token
export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const magicLink = await db.magicLink.findUnique({
    where: { managerId: session.user.id },
  })

  return NextResponse.json({ token: magicLink?.token ?? null })
}

// POST — regenerates the magic link token
export async function POST() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { nanoid } = await import('nanoid')
  const newToken = nanoid(24)

  const magicLink = await db.magicLink.update({
    where: { managerId: session.user.id },
    data: { token: newToken },
  })

  return NextResponse.json({ token: magicLink.token })
}

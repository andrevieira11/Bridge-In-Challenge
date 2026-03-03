import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(200),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = signupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { email, password, name, companyName } = parsed.data

    const existing = await db.manager.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: { email: ["That email's already registered — try signing in instead."] } },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const { nanoid } = await import('nanoid')
    const token = nanoid(24)

    await db.manager.create({
      data: {
        email,
        password: hashedPassword,
        name,
        companyName,
        magicLink: {
          create: { token },
        },
      },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('[signup]', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

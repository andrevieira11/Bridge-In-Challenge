import 'server-only'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { db } from './db'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const manager = await db.manager.findUnique({
          where: { email: parsed.data.email },
          include: { magicLink: true },
        })

        if (!manager) return null

        const valid = await bcrypt.compare(parsed.data.password, manager.password)
        if (!valid) return null

        return {
          id: manager.id,
          email: manager.email,
          name: manager.name,
          companyName: manager.companyName,
          magicLinkToken: manager.magicLink?.token ?? null,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!
        token.companyName = (user as { companyName: string }).companyName
        token.magicLinkToken = (user as { magicLinkToken: string | null }).magicLinkToken
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.companyName = token.companyName as string
      session.user.magicLinkToken = token.magicLinkToken as string | null
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' },
})

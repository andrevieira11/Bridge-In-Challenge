import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      companyName: string
      magicLinkToken: string | null
    }
  }

  interface User {
    id: string
    email: string
    name: string
    companyName: string
    magicLinkToken: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    companyName: string
    magicLinkToken: string | null
  }
}

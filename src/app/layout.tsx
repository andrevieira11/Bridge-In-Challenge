import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'BridgeIn — EU Whistleblowing Compliance',
    template: '%s | BridgeIn',
  },
  description:
    'Secure, anonymous whistleblowing infrastructure for EU Directive 2019/1937 compliance. Give your employees a safe way to speak up.',
  openGraph: {
    title: 'BridgeIn — EU Whistleblowing Compliance',
    description: 'Secure, anonymous whistleblowing infrastructure for modern companies.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}

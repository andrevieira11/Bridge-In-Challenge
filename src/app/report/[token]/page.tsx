import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { ReportForm } from './ReportForm'
import { Shield } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { token } = await params
  const magicLink = await db.magicLink.findUnique({
    where: { token },
    include: { manager: { select: { companyName: true } } },
  })

  if (!magicLink) return { title: 'Report Not Found' }

  return {
    title: `Submit a report — ${magicLink.manager.companyName}`,
    description: 'Submit a confidential or anonymous report securely.',
  }
}

export default async function ReportPage({ params }: PageProps) {
  const { token } = await params

  const magicLink = await db.magicLink.findUnique({
    where: { token },
    include: { manager: { select: { companyName: true } } },
  })

  if (!magicLink) notFound()

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      {/* Minimal header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-gray-200 bg-white">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-navy rounded-md flex items-center justify-center">
            <Shield className="w-3 h-3 text-teal" />
          </div>
          <span className="text-navy font-bold text-sm">BridgeIn</span>
        </Link>
        <p className="text-xs text-gray-400">Secure & confidential reporting</p>
      </header>

      <main className="max-w-xl mx-auto px-4 py-10">
        {/* Context */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-teal/10 text-teal text-xs font-medium px-3 py-1.5 rounded-full mb-4 border border-teal/20">
            <Shield className="w-3 h-3" />
            Report to {magicLink.manager.companyName}
          </div>
          <h1 className="text-2xl font-bold text-navy mb-2">Submit a confidential report</h1>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Your submission is encrypted in transit. You can remain completely anonymous
            or provide contact details for follow-up.
          </p>
        </div>

        <ReportForm token={token} companyName={magicLink.manager.companyName} />

        {/* Privacy note */}
        <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
          BridgeIn does not log IP addresses or browser fingerprints for anonymous submissions.
          Confidential reports are handled exclusively by your company&apos;s designated administrator.
        </p>
      </main>
    </div>
  )
}

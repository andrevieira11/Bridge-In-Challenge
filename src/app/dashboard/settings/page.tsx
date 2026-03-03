import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { CopyLinkSection } from './CopyLinkSection'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const magicLink = await db.magicLink.findUnique({
    where: { managerId: session.user.id },
  })

  const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const reportUrl = magicLink ? `${baseUrl}/report/${magicLink.token}` : null

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your workspace and submission link.</p>
      </div>

      {/* Magic link section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-navy mb-1">Employee submission link</h2>
        <p className="text-sm text-gray-500 mb-5">
          Share this link with your employees. Anyone with the link can submit a report — no login required.
        </p>

        {reportUrl ? (
          <CopyLinkSection url={reportUrl} />
        ) : (
          <p className="text-sm text-red-500">Magic link not found. Please contact support.</p>
        )}

        <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
          <p className="text-xs text-amber-800">
            <strong>Regenerating the link</strong> will immediately deactivate the old one.
            Any existing bookmarks employees have will stop working.
          </p>
        </div>
      </div>

      {/* Profile section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-navy mb-4">Your profile</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <span className="text-sm text-gray-500">Name</span>
            <span className="text-sm font-medium text-navy">{session.user.name}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-sm font-medium text-navy">{session.user.email}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-gray-500">Company</span>
            <span className="text-sm font-medium text-navy">{session.user.companyName}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  // Get count of new (unread) reports for sidebar badge
  const magicLink = await db.magicLink.findUnique({
    where: { managerId: session.user.id },
  })

  const newReportCount = magicLink
    ? await db.report.count({
        where: { magicLinkId: magicLink.id, status: 'new' },
      })
    : 0

  return (
    <div className="flex h-screen bg-cream overflow-hidden">
      <Sidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          companyName: session.user.companyName,
        }}
        newReportCount={newReportCount}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

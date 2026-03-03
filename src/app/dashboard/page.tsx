import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { ReportCard } from '@/components/dashboard/ReportCard'
import { FileText, Clock, CheckCircle, Archive, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const magicLink = await db.magicLink.findUnique({
    where: { managerId: session.user.id },
    include: {
      reports: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  const reports = magicLink?.reports ?? []
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const stats = {
    total: reports.length,
    newToday: reports.filter((r) => new Date(r.createdAt) >= startOfToday).length,
    inReview: reports.filter((r) => r.status === 'reviewing').length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
    newStatus: reports.filter((r) => r.status === 'new').length,
  }

  const recentReports = reports.slice(0, 5)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">
          Good {getTimeOfDay()}, {session.user.name.split(' ')[0]}.
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Here&apos;s what&apos;s happening at {session.user.companyName}.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total reports"
          value={stats.total}
          icon={FileText}
          iconBg="bg-gray-100"
          iconColor="text-gray-500"
        />
        <StatsCard
          label="New / unreviewed"
          value={stats.newStatus}
          icon={Clock}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          description={stats.newToday > 0 ? `${stats.newToday} received today` : undefined}
        />
        <StatsCard
          label="In review"
          value={stats.inReview}
          icon={FileText}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatsCard
          label="Resolved"
          value={stats.resolved}
          icon={CheckCircle}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* Recent reports */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-navy">Recent reports</h2>
        {reports.length > 5 && (
          <Link href="/dashboard/reports">
            <Button variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-navy">
              View all {reports.length} →
            </Button>
          </Link>
        )}
      </div>

      {recentReports.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Archive className="w-5 h-5 text-gray-300" />
          </div>
          <p className="font-medium text-navy mb-1">No reports yet</p>
          <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
            That&apos;s either very good news or your link hasn&apos;t been shared with employees yet.
          </p>
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm">
              <Link2 className="w-3.5 h-3.5 mr-2" />
              Get your submission link
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {recentReports.map((report) => (
            <ReportCard
              key={report.id}
              report={{
                ...report,
                createdAt: report.createdAt.toISOString(),
                updatedAt: report.updatedAt.toISOString(),
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function getTimeOfDay() {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

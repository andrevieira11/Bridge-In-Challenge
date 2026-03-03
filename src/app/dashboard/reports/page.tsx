import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { ReportCard } from '@/components/dashboard/ReportCard'
import { Archive, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'reviewing', label: 'In Review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session) redirect('/login')

  const params = await searchParams
  const activeFilter = params.status || 'all'

  const magicLink = await db.magicLink.findUnique({
    where: { managerId: session.user.id },
  })

  const reports = magicLink
    ? await db.report.findMany({
        where: {
          magicLinkId: magicLink.id,
          ...(activeFilter !== 'all' ? { status: activeFilter } : {}),
        },
        orderBy: { createdAt: 'desc' },
      })
    : []

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">
          All reports submitted to your {session.user.companyName} portal.
        </p>
      </div>

      {/* Status filters */}
      <div className="flex items-center gap-1 mb-6 bg-white rounded-lg border border-gray-100 p-1 shadow-sm w-fit">
        <Filter className="w-3.5 h-3.5 text-gray-300 ml-2 mr-1" />
        {STATUS_FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={filter.value === 'all' ? '/dashboard/reports' : `/dashboard/reports?status=${filter.value}`}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              activeFilter === filter.value
                ? 'bg-navy text-white'
                : 'text-gray-500 hover:text-navy hover:bg-gray-50'
            )}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Archive className="w-5 h-5 text-gray-300" />
          </div>
          <p className="font-medium text-navy mb-1">
            {activeFilter === 'all' ? 'No reports yet' : `No ${activeFilter} reports`}
          </p>
          <p className="text-sm text-gray-400 max-w-xs mx-auto">
            {activeFilter === 'all'
              ? "Reports submitted via your magic link will appear here."
              : `You don't have any reports with status "${activeFilter}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-400 mb-3">
            {reports.length} {reports.length === 1 ? 'report' : 'reports'}
            {activeFilter !== 'all' ? ` with status "${activeFilter}"` : ''}
          </p>
          {reports.map((report) => (
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

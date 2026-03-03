'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, EyeOff, Mail, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { StatusBadge } from './StatusBadge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn, formatRelativeTime, getCategoryLabel } from '@/lib/utils'

interface Report {
  id: string
  title: string
  description: string
  category: string
  status: string
  isAnonymous: boolean
  contactEmail: string | null
  createdAt: string
  updatedAt: string
}

interface ReportCardProps {
  report: Report
  onStatusChange?: (id: string, newStatus: string) => void
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'reviewing', label: 'In Review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

export function ReportCard({ report, onStatusChange }: ReportCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState(report.status)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update')
      setStatus(newStatus)
      onStatusChange?.(report.id, newStatus)
      toast.success('Status updated')
    } catch {
      toast.error('Could not update status. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-100 shadow-sm transition-all',
        status === 'new' && 'border-l-4 border-l-blue-400'
      )}
    >
      <div
        className="p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <StatusBadge status={status} />
              <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5">
                {getCategoryLabel(report.category)}
              </span>
            </div>
            <h3 className="font-semibold text-navy text-sm leading-snug mt-2 truncate">
              {report.title}
            </h3>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatRelativeTime(report.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                {report.isAnonymous ? (
                  <>
                    <EyeOff className="w-3 h-3" />
                    Anonymous
                  </>
                ) : (
                  <>
                    <Mail className="w-3 h-3" />
                    Contact provided
                  </>
                )}
              </span>
            </div>
          </div>
          <div className="shrink-0 text-gray-300">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-50">
          <div className="pt-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Description
              </p>
              <p className="text-sm text-navy/80 leading-relaxed whitespace-pre-wrap">
                {report.description}
              </p>
            </div>

            {!report.isAnonymous && report.contactEmail && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Contact
                </p>
                <a
                  href={`mailto:${report.contactEmail}`}
                  className="text-sm text-teal hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {report.contactEmail}
                </a>
                <p className="text-xs text-gray-400 mt-1">
                  Handle with care — this employee chose to identify themselves.
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Update status
              </p>
              <Select
                value={status}
                onValueChange={handleStatusChange}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isUpdating && (
                <span className="text-xs text-gray-400">Saving…</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

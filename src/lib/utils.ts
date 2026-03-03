import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export type ReportStatus = 'new' | 'reviewing' | 'resolved' | 'closed'

export function getStatusConfig(status: ReportStatus) {
  const configs: Record<ReportStatus, { label: string; className: string }> = {
    new: {
      label: 'New',
      className: 'bg-blue-50 text-blue-700 border border-blue-200',
    },
    reviewing: {
      label: 'In Review',
      className: 'bg-amber-50 text-amber-700 border border-amber-200',
    },
    resolved: {
      label: 'Resolved',
      className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    },
    closed: {
      label: 'Closed',
      className: 'bg-gray-100 text-gray-500 border border-gray-200',
    },
  }
  return configs[status] ?? configs.closed
}

export const REPORT_CATEGORIES = [
  { value: 'financial_misconduct', label: 'Financial misconduct or fraud' },
  { value: 'safety_violation', label: 'Health and safety violation' },
  { value: 'discrimination', label: 'Discrimination or harassment' },
  { value: 'data_breach', label: 'Data protection breach' },
  { value: 'corruption', label: 'Corruption or bribery' },
  { value: 'environmental', label: 'Environmental violation' },
  { value: 'other', label: 'Other' },
] as const

export type ReportCategory = (typeof REPORT_CATEGORIES)[number]['value']

export function getCategoryLabel(value: string): string {
  return REPORT_CATEGORIES.find((c) => c.value === value)?.label ?? value
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

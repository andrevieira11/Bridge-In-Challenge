import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  label: string
  value: number
  icon: LucideIcon
  iconBg: string
  iconColor: string
  description?: string
}

export function StatsCard({ label, value, icon: Icon, iconBg, iconColor, description }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className={cn('p-2 rounded-lg', iconBg)}>
          <Icon className={cn('h-4 w-4', iconColor)} />
        </div>
      </div>
      <p className="text-3xl font-bold text-navy tabular-nums">{value}</p>
      {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
    </div>
  )
}

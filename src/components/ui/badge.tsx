import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-teal/10 text-teal border-teal/20',
        secondary: 'bg-gray-100 text-gray-600 border-gray-200',
        new: 'bg-blue-50 text-blue-700 border-blue-200',
        reviewing: 'bg-amber-50 text-amber-700 border-amber-200',
        resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        closed: 'bg-gray-100 text-gray-500 border-gray-200',
        destructive: 'bg-red-50 text-red-700 border-red-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }

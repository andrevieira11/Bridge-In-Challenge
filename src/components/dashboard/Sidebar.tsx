'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, FileText, Settings, Shield, LogOut } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'

interface SidebarProps {
  user: {
    name: string
    email: string
    companyName: string
  }
  newReportCount?: number
}

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/reports', label: 'Reports', icon: FileText, exact: false },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, exact: false },
]

export function Sidebar({ user, newReportCount = 0 }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-64 bg-navy flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-teal rounded-md flex items-center justify-center shrink-0">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">BridgeIn</span>
        </Link>
        <p className="text-white/30 text-xs mt-1 ml-9 truncate">{user.companyName}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
                active
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-teal rounded-r-full" />
              )}
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
              {item.label === 'Reports' && newReportCount > 0 && (
                <span className="ml-auto bg-teal text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {newReportCount > 9 ? '9+' : newReportCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center shrink-0">
            <span className="text-teal text-xs font-bold">{getInitials(user.name)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user.name}</p>
            <p className="text-white/40 text-xs truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 px-3 py-2 w-full text-white/40 hover:text-white text-sm rounded-lg hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  )
}

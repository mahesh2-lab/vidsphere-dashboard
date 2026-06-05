'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/auth-client'
import {
  LayoutDashboard,
  Video,
  BarChart3,
  Settings,
  Play,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const menuItems = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    icon: Video,
    label: 'Videos',
    href: '/videos',
  },

  {
    icon: BarChart3,
    label: 'Analytics',
    href: '/analytics',
  },

  {
    icon: Settings,
    label: 'Settings',
    href: '/settings',
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed left-0 top-0 h-screen w-48 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold">
            YT
          </div>
          <span className="font-semibold text-gray-900">Creator Platform</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 ${
                    isActive
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </div>
      </nav>


    </div>
  )
}

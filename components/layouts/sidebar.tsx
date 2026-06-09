'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Play, 
  LayoutDashboard, 
  FolderOpen, 
  Layers, 
  Key,
  Activity, 
  BookOpen, 
  Settings, 
  CreditCard,
  LogOut
} from 'lucide-react'
import { authClient } from '@/lib/auth/auth-client'

const navigation = [
  {
    group: 'MAIN',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Media Library', href: '/media', icon: FolderOpen },
      { name: 'Buckets', href: '/buckets', icon: Layers },
    ]
  },
  {
    group: 'DEVELOPER',
    items: [
      { name: 'API Keys', href: '/developers/keys', icon: Key },
      { name: 'Usage & Logs', href: '/developers/usage', icon: Activity },
      { name: 'Documentation', href: '/developers/docs', icon: BookOpen },
    ]
  },
  {
    group: 'ACCOUNT',
    items: [
      { name: 'Settings', href: '/settings', icon: Settings },
      { name: 'Billing', href: '/billing', icon: CreditCard },
    ]
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-60 bg-[#f7f7f5] border-r border-[#e9e9e7] h-screen flex flex-col">
      {/* Logo Area */}
      <div className="p-4 flex-shrink-0">
        <Link href="/dashboard" className="flex flex-col">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-zinc-800" fill="currentColor" />
            <span className="text-sm font-medium text-zinc-800">VidSphere</span>
          </div>
          <span className="text-xs text-zinc-400 mt-0.5 ml-6">workspace</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-6 mt-2">
        {navigation.map((group) => (
          <div key={group.group}>
            <div className="text-[10px] font-medium uppercase tracking-widest text-zinc-400 px-2 mb-1">
              {group.group}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.href)
                const Icon = item.icon
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-[#e9e9e7] text-zinc-900 font-medium' 
                        : 'text-zinc-600 hover:bg-[#e9e9e7] hover:text-zinc-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Avatar / Profile */}
      <div className="p-4 border-t border-[#e9e9e7] flex-shrink-0 flex items-center justify-between">
        <Link href="/settings" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-medium text-zinc-600">
            U
          </div>
          <span className="text-sm text-zinc-600 font-medium truncate max-w-[100px]">User Account</span>
        </Link>
        <button 
          onClick={async () => {
            await authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  window.location.href = '/sign-in'
                }
              }
            })
          }}
          className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-[#e9e9e7] rounded-md transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

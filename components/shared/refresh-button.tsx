'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { clearYouTubeCache } from '@/features/youtube/actions/youtube'

export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await clearYouTubeCache()
      router.refresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="flex items-center gap-2 border border-[#e9e9e7] rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-[#f7f7f5] transition-colors disabled:opacity-50"
    >
      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-zinc-400' : 'text-zinc-500'}`} />
      Refresh Data
    </button>
  )
}

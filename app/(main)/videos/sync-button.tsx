'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { fetchYouTubeVideos } from '@/app/actions/youtube'

export function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await fetchYouTubeVideos()
    } catch (error) {
      console.error(error)
      alert('Failed to sync videos')
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Button onClick={handleSync} disabled={isSyncing} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
      <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? 'Syncing...' : 'Sync Data'}
    </Button>
  )
}

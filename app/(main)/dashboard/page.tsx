import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUserVideos, getLiveChannelStats } from '@/app/actions/youtube'
import { PageHeader } from '@/components/layout/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { RefreshButton } from '@/components/refresh-button'
import { UploadCloud, FolderPlus, Key, BookOpen, Video, Trash2, MonitorPlay } from 'lucide-react'
import { db } from '@/lib/db'
import { uploads, apiKeys, apiLogs } from '@/lib/db/schema'
import { eq, desc, count, and, gte } from 'drizzle-orm'

function getRelativeTime(timestamp: number) {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const daysDifference = Math.round((timestamp - Date.now()) / (1000 * 60 * 60 * 24));
  if (Math.abs(daysDifference) > 0) return rtf.format(daysDifference, 'day');
  
  const hoursDifference = Math.round((timestamp - Date.now()) / (1000 * 60 * 60));
  if (Math.abs(hoursDifference) > 0) return rtf.format(hoursDifference, 'hour');

  const minutesDifference = Math.round((timestamp - Date.now()) / (1000 * 60));
  return rtf.format(minutesDifference, 'minute');
}

async function DashboardStats({ userId }: { userId: string }) {
  let userUploads: any[] = [];
  let userKeys: any[] = [];
  let monthlyLogs: any[] = [];
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    [userUploads, userKeys, monthlyLogs] = await Promise.all([
      db.select().from(uploads).where(eq(uploads.userId, userId)),
      db.select().from(apiKeys).where(eq(apiKeys.userId, userId)),
      db.select().from(apiLogs).where(
        and(
          eq(apiLogs.userId, userId),
          gte(apiLogs.createdAt, startOfMonth)
        )
      )
    ]);
  } catch (e) {
    console.error(e);
  }

  const totalVideos = userUploads.length;
  
  // Calculate storage based on actual fileSize in metadata, fallback to 150MB per video
  const storageUsedBytes = userUploads.reduce((acc, u) => {
    const size = (u.metadata as any)?.fileSize;
    return acc + (typeof size === 'number' ? size : 150 * 1024 * 1024);
  }, 0);
  
  const storageUsedGB = (storageUsedBytes / (1024 * 1024 * 1024)).toFixed(1);
  const storageTotalGB = 10;
  
  // Active API Keys
  const activeKeysCount = userKeys.length;
  
  // Real API calls from api_logs
  const apiCalls = monthlyLogs.length;

  return (
    <div className="grid grid-cols-4 gap-4 mt-8">
      <StatCard 
        label="Total Videos" 
        value={totalVideos} 
      />
      <StatCard 
        label="Storage Used" 
        value={<span className="text-3xl font-medium text-zinc-900">{storageUsedGB} <span className="text-base text-zinc-400">/ {storageTotalGB} GB</span></span>}
        progress={(Number(storageUsedGB) / storageTotalGB) * 100}
      />
      <StatCard 
        label="Active API Keys" 
        value={activeKeysCount} 
      />
      <StatCard 
        label="API Calls This Month" 
        value={apiCalls.toLocaleString()} 
      />
    </div>
  )
}

function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4 mt-8">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-[120px] bg-[#f7f7f5] rounded-xl border border-[#e9e9e7] animate-pulse" />
      ))}
    </div>
  )
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  // Fetch recent uploads and keys concurrently
  const [recentUploads, recentKeys] = await Promise.all([
    db.select()
      .from(uploads)
      .where(eq(uploads.userId, session.user.id))
      .orderBy(desc(uploads.createdAt))
      .limit(3),
    db.select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, session.user.id))
      .orderBy(desc(apiKeys.createdAt))
      .limit(2)
  ])

  const activityStream = [
    ...recentUploads.map(u => ({
      id: u.id,
      type: 'upload',
      text: `'${u.title}' uploaded via Dashboard`,
      time: u.createdAt ? getRelativeTime(new Date(u.createdAt).getTime()) : 'Recently',
      timestamp: u.createdAt ? new Date(u.createdAt).getTime() : 0,
      icon: UploadCloud
    })),
    ...recentKeys.map(k => ({
      id: k.id,
      type: 'key',
      text: `New API key "${k.name}" created`,
      time: k.createdAt ? getRelativeTime(new Date(k.createdAt).getTime()) : 'Recently',
      timestamp: k.createdAt ? new Date(k.createdAt).getTime() : 0,
      icon: Key
    }))
  ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5)

  const recentActivity = activityStream.length > 0 ? activityStream : [
    { id: 1, type: 'info', text: 'Welcome to your dashboard! Upload your first video to see activity.', time: 'Just now', timestamp: Date.now(), icon: MonitorPlay }
  ]

  return (
    <div className="max-w-5xl mx-auto py-8 px-10">
      <PageHeader 
        title="Dashboard" 
        description={`Welcome back, ${session.user.name || 'User'}.`}
      >
        <RefreshButton />
      </PageHeader>

      <Suspense fallback={<DashboardStatsSkeleton />}>
        <DashboardStats userId={session.user.id} />
      </Suspense>

      {/* Activity + Quick Actions */}
      <div className="flex gap-6 mt-10">
        
        {/* Left: Recent Activity */}
        <div className="flex-1">
          <h2 className="text-base font-medium text-zinc-900 mb-4">Recent Activity</h2>
          <div className="border-t border-[#e9e9e7]">
            {recentActivity.map((activity) => {
              const Icon = activity.icon
              return (
                <div key={activity.id} className="flex items-center justify-between py-3 border-b border-[#e9e9e7]">
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm text-zinc-700">{activity.text}</span>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">{activity.time}</span>
                </div>
              )
            })}
          </div>
          <Link href="/developers/usage" className="inline-block mt-4 text-xs text-blue-500 hover:underline">
            View all logs &rarr;
          </Link>
        </div>

        {/* Right: Quick Actions */}
        <div className="w-72 shrink-0">
          <h2 className="text-base font-medium text-zinc-900 mb-4">Quick Actions</h2>
          <div className="flex flex-col gap-3">
            <Link href="/upload" className="flex items-center gap-3 border border-[#e9e9e7] rounded-lg px-4 py-3 hover:bg-[#f7f7f5] transition-colors text-left w-full group">
              <UploadCloud className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600" />
              <span className="text-sm text-zinc-700 font-medium">Upload a video</span>
            </Link>
            <Link href="/buckets" className="flex items-center gap-3 border border-[#e9e9e7] rounded-lg px-4 py-3 hover:bg-[#f7f7f5] transition-colors group">
              <FolderPlus className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600" />
              <span className="text-sm text-zinc-700 font-medium">Create a bucket</span>
            </Link>
            <Link href="/developers/keys" className="flex items-center gap-3 border border-[#e9e9e7] rounded-lg px-4 py-3 hover:bg-[#f7f7f5] transition-colors group">
              <Key className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600" />
              <span className="text-sm text-zinc-700 font-medium">Generate API key</span>
            </Link>
            <Link href="/developers/docs" className="flex items-center gap-3 border border-[#e9e9e7] rounded-lg px-4 py-3 hover:bg-[#f7f7f5] transition-colors group">
              <BookOpen className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600" />
              <span className="text-sm text-zinc-700 font-medium">Read the docs</span>
            </Link>
          </div>
        </div>

      </div>

      {/* Storage Breakdown */}
      <div className="mt-10">
        <h2 className="text-base font-medium text-zinc-900 mb-4">Storage breakdown</h2>
        <div className="h-3 rounded-full overflow-hidden flex w-full">
          <div className="h-full bg-zinc-900" style={{ width: '60%' }} title="MP4" />
          <div className="h-full bg-zinc-500" style={{ width: '25%' }} title="MOV" />
          <div className="h-full bg-zinc-300" style={{ width: '15%' }} title="Other" />
        </div>
        <div className="flex gap-6 mt-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-zinc-900" />
            <span className="text-xs text-zinc-500">MP4 (1.4 GB)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-zinc-500" />
            <span className="text-xs text-zinc-500">MOV (600 MB)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-zinc-300" />
            <span className="text-xs text-zinc-500">Other (400 MB)</span>
          </div>
        </div>
      </div>
    </div>
  )
}


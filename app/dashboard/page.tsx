import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { getUserChannel, getUserVideos, getLiveChannelStats } from '@/app/actions/youtube'
import { buttonVariants } from '@/components/ui/button'
import { Users, Eye, Clock } from 'lucide-react'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    redirect('/sign-in')
  }

  const channel = await getUserChannel()
  const videos = await getUserVideos()
  
  let liveStats = null
  if (channel) {
    liveStats = await getLiveChannelStats()
  }

  const stats = [
    {
      label: 'Subscribers',
      value: liveStats?.subscriberCount ? liveStats.subscriberCount.toLocaleString() : '0',
      change: 'Live from YouTube API',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      label: 'Total Views',
      value: liveStats?.totalViews ? liveStats.totalViews.toLocaleString() : '0',
      change: 'Lifetime',
      icon: Eye,
      color: 'text-green-600',
    },
    {
      label: 'Total Uploads',
      value: videos?.length || '0',
      change: `${liveStats?.videoCount || 0} on YouTube`,
      icon: Clock,
      color: 'text-orange-600',
    },
  ]

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <main className="flex-1 ml-48 overflow-auto">
        <Topbar user={session.user} />
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Channel Dashboard</h1>
            {channel && (
              <p className="text-gray-600 mt-2">{channel.channelName}</p>
            )}
          </div>

          {!channel ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">No channel connected yet</p>
              <a href="/settings" className={buttonVariants({ variant: 'default' })}>
                Connect YouTube Channel
              </a>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-6 mb-8">
                {stats.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-600 text-sm font-medium">{stat.label}</h3>
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                      <p className="text-xs text-gray-500">{stat.change}</p>
                    </div>
                  )
                })}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Uploads</h2>
                {videos && videos.length > 0 ? (
                  <div className="space-y-3">
                    {videos.slice(0, 5).map((v) => (
                      <div key={v.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{v.title}</p>
                          <p className="text-xs text-gray-500">
                            {(v.viewCount ?? 0).toLocaleString()} views • {v.commentCount ?? 0} comments
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {v.publishedAt ? new Date(v.publishedAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No videos uploaded yet</p>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getUserChannel, getUserVideos } from '@/app/actions/youtube'
import { AnalyticsCharts } from './analytics-charts'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export default async function AnalyticsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    redirect('/sign-in')
  }

  const channel = await getUserChannel()
  const videos = channel ? await getUserVideos() : []

  // Prepare chart data
  const videoData = videos
    ?.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime())
    .slice(0, 10)
    .reverse()
    .map((v) => ({
      name: v.title?.substring(0, 15) || 'Video',
      views: v.viewCount ?? 0,
      comments: v.commentCount ?? 0,
      likes: v.likeCount ?? 0,
    })) || []

  const viewDistribution = [
    { name: 'Published', value: videos?.filter((v) => v.status === 'published').length || 0 },
    { name: 'Drafts', value: videos?.filter((v) => v.status !== 'published').length || 0 },
  ]



  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Overview</h1>
              <p className="text-gray-600 mt-2">Detailed demographic data requires the YouTube Analytics API.</p>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>

          {!channel ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600">No channel connected yet. Connect your YouTube channel to view analytics.</p>
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <p className="text-gray-600 text-sm font-medium mb-2">Total Views</p>
                  <p className="text-3xl font-bold text-gray-900">{channel?.totalViews?.toLocaleString() || '0'}</p>
                  <div className="h-1 bg-red-600 rounded mt-4" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <p className="text-gray-600 text-sm font-medium mb-2">Subscribers</p>
                  <p className="text-3xl font-bold text-gray-900">{channel?.subscriberCount?.toLocaleString() || '0'}</p>
                  <div className="h-1 bg-green-600 rounded mt-4" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <p className="text-gray-600 text-sm font-medium mb-2">Videos Published</p>
                  <p className="text-3xl font-bold text-gray-900">{videos?.length || '0'}</p>
                  <div className="h-1 bg-blue-600 rounded mt-4" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <p className="text-gray-600 text-sm font-medium mb-2">Total Engagement</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {(
                      (videos?.reduce((sum: any, v: { commentCount: any; likeCount: any }) => sum + (v.commentCount ?? 0) + (v.likeCount ?? 0), 0) || 0)
                    ).toLocaleString()}
                  </p>
                  <div className="h-1 bg-orange-600 rounded mt-4" />
                </div>
              </div>

              {/* Charts */}
              <AnalyticsCharts videoData={videoData} viewDistribution={viewDistribution} />

              {/* Top Videos */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Top Performing Videos</h3>
                <div className="space-y-3">
                  {videos
                    ?.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
                    .slice(0, 5)
                    .map((v) => (
                      <div key={v.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{v.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(v.viewCount ?? 0).toLocaleString()} views • {v.commentCount ?? 0} comments
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{(v.viewCount ?? 0).toLocaleString()}</p>
                          <p className="text-xs text-gray-500">views</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
    </>
  )
}

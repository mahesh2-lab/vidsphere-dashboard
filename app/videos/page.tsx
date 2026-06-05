import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { getUserVideos, syncYouTubeChannel, fetchYouTubeVideos } from '@/app/actions/youtube'
import { buttonVariants, Button } from '@/components/ui/button'
import { Eye, MessageCircle, Trash2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { SyncButton } from './sync-button'

export default async function VideosPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    redirect('/sign-in')
  }

  const videos = await getUserVideos()

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <main className="flex-1 ml-48 overflow-auto">
        <Topbar user={session.user} />
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Channel Videos</h1>
              <p className="text-gray-600 mt-2">{videos?.length || 0} videos in your channel</p>
            </div>
            <div className="flex gap-3">
              <SyncButton />
              <Link href="/upload" className={buttonVariants({ variant: 'outline' })}>
                + New Upload
              </Link>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900">Video</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900">Visibility</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900">Views</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900">Comments</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {videos && videos.length > 0 ? (
                    videos.map((video) => (
                      <tr key={video.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            {video.thumbnailUrl && (
                              <img
                                src={video.thumbnailUrl}
                                alt={video.title}
                                className="w-12 h-12 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900 line-clamp-2">{video.title}</p>
                              <p className="text-xs text-gray-500 mt-1">{video.videoId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded ${
                              video.visibility === 'public'
                                ? 'bg-green-100 text-green-700'
                                : video.visibility === 'unlisted'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {video.visibility}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Eye className="w-4 h-4" />
                            {(video.viewCount ?? 0).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MessageCircle className="w-4 h-4" />
                            {video.commentCount ?? 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="ghost">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        <p>No videos found. Connect your YouTube channel to see your videos.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>


        </div>
      </main>
    </div>
  )
}

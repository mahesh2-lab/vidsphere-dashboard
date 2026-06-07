import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Search, ChevronDown, LayoutGrid, List, UploadCloud } from 'lucide-react'
import { getUserChannel, getUserVideos } from '@/app/actions/youtube'
import { VideoCard } from '@/components/ui/video-card'

export default async function BucketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const bucketName = decodeURIComponent(resolvedParams.id)

  const channel = await getUserChannel()
  const allVideos = channel ? await getUserVideos() : []
  
  const videos = allVideos.filter((v: any) => (v.bucket || 'default') === bucketName)

  return (
    <div className="max-w-7xl mx-auto py-8 px-10">
      <div className="text-sm text-zinc-400 mb-6">
        <Link href="/buckets" className="hover:text-zinc-600">Buckets</Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-700">{bucketName}</span>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-medium text-zinc-900">{bucketName}</h1>
        <span className="bg-[#f7f7f5] border border-[#e9e9e7] text-zinc-600 text-xs px-2 py-0.5 rounded-full">
          {videos.length} videos
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mt-8">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search in bucket..." 
              className="bg-[#f7f7f5] border border-[#e9e9e7] rounded-md pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-zinc-400 focus:bg-white transition-colors w-64"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#f7f7f5] border border-[#e9e9e7] rounded-md px-3 py-1.5 text-sm text-zinc-700 hover:bg-white transition-colors">
            Format <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>
          
          <div className="flex items-center bg-[#f7f7f5] border border-[#e9e9e7] rounded-md p-0.5 mx-2">
            <button className="p-1.5 bg-white shadow-sm rounded text-zinc-900">
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-zinc-500 hover:text-zinc-900">
              <List className="w-4 h-4" />
            </button>
          </div>

          <Link href="/upload" className="bg-zinc-900 text-white text-sm px-4 py-1.5 rounded-md hover:bg-zinc-700 transition-colors flex items-center gap-2">
            <UploadCloud className="w-4 h-4" />
            Upload Video
          </Link>
        </div>
      </div>

      {/* Grid */}
      {videos.length > 0 ? (
        <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mt-8">
          {videos.map((v: any) => {
            let formattedDuration = ''
            if (v.duration) {
              const match = v.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
              if (match) {
                const h = match[1] ? `${match[1]}h ` : ''
                const m = match[2] ? `${match[2]}m ` : ''
                const s = match[3] ? `${match[3]}s` : ''
                formattedDuration = `${h}${m}${s}`.trim()
              }
            }

            return (
              <VideoCard
                key={v.id}
                id={v.id}
                title={v.title || 'Untitled Video'}
                thumbnailUrl={v.thumbnailUrl || undefined}
                bucket={v.bucket || 'default'}
                duration={formattedDuration || '0s'}
                status={v.status === 'processed' ? 'ready' : v.status}
              />
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 mt-8">
          <div className="border border-dashed border-[#e9e9e7] rounded-xl p-16 max-w-md w-full bg-[#f7f7f5]/50 text-center">
            <h3 className="text-sm font-medium text-zinc-700">No videos in this bucket</h3>
            <p className="text-xs text-zinc-400 mt-1 mb-6">Upload videos to see them here</p>
            <Link href="/upload" className="inline-block bg-zinc-900 text-white text-sm px-4 py-1.5 rounded-md hover:bg-zinc-700 transition-colors">
              Upload Video
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

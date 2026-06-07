import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { fetchYouTubeVideo } from '@/app/actions/youtube'
import { StatusBadge } from '@/components/ui/status-badge'
import { Panel } from '@/components/ui/panel'
import { DataRow } from '@/components/ui/data-row'
import { CodeBlock } from '@/components/ui/code-block'
import { YouTubePlayer } from '@/components/ui/youtube-player'

async function VideoDetails({ videoId }: { videoId: string }) {
  let video: any = null;
  try {
    video = await fetchYouTubeVideo(videoId);
  } catch (e) {
    console.error(e);
  }
  
  if (!video) redirect('/media')

  const status = video.status === 'processed' ? 'published' : video.status || 'published'

  return (
    <>
      <div className="text-sm text-zinc-400 mb-6">
        <Link href="/media" className="hover:text-zinc-600">Media Library</Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-700">{video.title}</span>
      </div>

      <div className="flex gap-8">
        {/* Left Column */}
        <div className="flex-1">
          {/* Player */}
          <div className="aspect-video rounded-xl overflow-hidden bg-[#f7f7f5] border border-[#e9e9e7]">
            {video.videoId ? (
              <YouTubePlayer 
                videoId={video.videoId} 
                title={video.title} 
                thumbnailUrl={video.thumbnailUrl} 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                <span className="text-sm">Video Processing</span>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-6 border-b border-[#e9e9e7]">
            <button className="pb-2 text-sm border-b-2 border-zinc-900 text-zinc-900 font-medium">Overview</button>
          </div>

          <div className="mt-6">
            <h1 className="text-xl font-medium text-zinc-900 flex items-center gap-3">
              {video.title}
              {status && status !== 'published' && <StatusBadge status={status} />}
            </h1>
            
            <div className="flex items-center gap-2 mt-4">
              <span className="bg-[#f7f7f5] text-xs text-zinc-600 px-2 py-0.5 rounded-full border border-[#e9e9e7]">
                marketing
              </span>
              <span className="bg-[#f7f7f5] text-xs text-zinc-600 px-2 py-0.5 rounded-full border border-[#e9e9e7]">
                q3-campaign
              </span>
              <input 
                type="text" 
                placeholder="Add tag..." 
                className="bg-transparent text-xs text-zinc-400 focus:outline-none focus:text-zinc-700 w-20"
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-80 shrink-0 flex flex-col gap-4">
          <Panel title="Asset Info">
            <DataRow label="Video ID" value={video.id.substring(0, 10) + '...'} />
            <DataRow label="Format" value="MP4" />
            <DataRow label="Size" value="142.3 MB" />
            <DataRow label="Resolution" value="1920 x 1080" />
            <DataRow label="Duration" value="2m 34s" />
            <DataRow label="Frame rate" value="30 fps" />
            <DataRow label="Uploaded" value={video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : 'N/A'} />
            <DataRow label="Source" value="Dashboard" />
          </Panel>

          <Panel title="Collections">
            <div className="p-4 bg-white">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-[#f7f7f5] text-xs text-zinc-600 px-2 py-0.5 rounded-full border border-[#e9e9e7]">
                  Marketing Videos
                </span>
              </div>
              <button className="border border-dashed border-[#e9e9e7] text-xs text-zinc-400 rounded-md px-2 py-1 hover:bg-[#f7f7f5] transition-colors">
                + Add to collection
              </button>
            </div>
          </Panel>

          <Panel title="Danger Zone" danger>
            <div className="p-4 bg-white">
              <p className="text-xs text-zinc-400 mb-3">Delete this asset permanently.</p>
              <button className="border border-red-200 text-red-500 text-sm rounded-md px-3 py-1.5 hover:bg-red-50 transition-colors">
                Delete asset
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </>
  )
}

function VideoDetailsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-32 bg-[#f7f7f5] rounded mb-6" />
      <div className="flex gap-8">
        <div className="flex-1">
          <div className="aspect-video rounded-xl bg-[#f7f7f5] border border-[#e9e9e7]" />
          <div className="mt-6 flex gap-6 border-b border-[#e9e9e7]">
            <div className="h-6 w-20 bg-[#f7f7f5] rounded mb-2" />
          </div>
          <div className="mt-6">
            <div className="h-8 w-64 bg-[#f7f7f5] rounded" />
            <div className="flex items-center gap-2 mt-4">
              <div className="h-5 w-20 bg-[#f7f7f5] rounded-full" />
              <div className="h-5 w-24 bg-[#f7f7f5] rounded-full" />
            </div>
          </div>
        </div>
        <div className="w-80 shrink-0 flex flex-col gap-4">
          <div className="h-64 bg-[#f7f7f5] rounded-xl border border-[#e9e9e7]" />
          <div className="h-40 bg-[#f7f7f5] rounded-xl border border-[#e9e9e7]" />
          <div className="h-32 bg-[#f7f7f5] rounded-xl border border-[#e9e9e7]" />
        </div>
      </div>
    </div>
  )
}

export default async function MediaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const { id: videoId } = await params;

  return (
    <div className="max-w-7xl mx-auto py-8 px-10">
      <Suspense fallback={<VideoDetailsSkeleton />}>
        <VideoDetails videoId={videoId} />
      </Suspense>
    </div>
  )
}

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { BucketCard } from '@/components/ui/bucket-card'
import { getUserChannel, getUserVideos } from '@/app/actions/youtube'
import { FolderPlus } from 'lucide-react'
import Link from 'next/link'

export default async function BucketsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const channel = await getUserChannel()
  const videos = channel ? await getUserVideos() : []

  const bucketsMap: Record<string, any[]> = {}
  videos.forEach((v: any) => {
    const b = v.bucket || 'default'
    if (!bucketsMap[b]) bucketsMap[b] = []
    bucketsMap[b].push(v)
  })

  const buckets = Object.keys(bucketsMap).map(b => ({
    id: b,
    name: b,
    count: bucketsMap[b].length,
    updatedAt: bucketsMap[b][0]?.publishedAt ? new Date(bucketsMap[b][0].publishedAt).toLocaleDateString() : 'Recently',
    thumbnails: bucketsMap[b].slice(0, 4).map((v: any) => v.thumbnailUrl).filter(Boolean)
  }))

  return (
    <div className="max-w-7xl mx-auto py-8 px-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium text-zinc-900">Buckets</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Organize and filter your videos by bucket</p>
        </div>
        <Link href="/upload" className="flex items-center gap-2 bg-zinc-900 text-white text-sm px-4 py-1.5 rounded-md hover:bg-zinc-700 transition-colors">
          <FolderPlus className="w-4 h-4" />
          New Bucket
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        {buckets.map((c) => (
          <Link href={`/buckets/${encodeURIComponent(c.id)}`} key={c.id} className="block">
            <BucketCard
              id={c.id}
              name={c.name}
              count={c.count}
              updatedAt={c.updatedAt}
              thumbnails={c.thumbnails}
            />
          </Link>
        ))}
        {buckets.length === 0 && (
          <div className="col-span-3 py-24 text-center border border-dashed border-[#e9e9e7] rounded-xl bg-[#f7f7f5]/50">
            <p className="text-sm font-medium text-zinc-700">No buckets found</p>
            <p className="text-xs text-zinc-400 mt-1">Upload a video and assign it to a bucket</p>
          </div>
        )}
      </div>
    </div>
  )
}

import { Play } from 'lucide-react'
import { StatusBadge } from './status-badge'
import Link from 'next/link'

export function VideoListRow({ 
  id, 
  title, 
  thumbnailUrl, 
  bucket, 
  duration, 
  status 
}: {
  id: string
  title: string
  thumbnailUrl?: string
  bucket: string
  duration: string
  status: string
}) {
  return (
    <Link href={`/media/${id}`} className="group flex items-center gap-4 bg-white border border-[#e9e9e7] rounded-lg overflow-hidden hover:border-zinc-300 hover:shadow-sm transition-all relative cursor-pointer p-2 pr-6">
      <div className="w-40 aspect-video shrink-0 bg-[#f7f7f5] rounded-md relative flex items-center justify-center overflow-hidden">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <Play className="w-6 h-6 text-zinc-300" fill="currentColor" />
        )}
        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
          {duration}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-zinc-800 truncate" title={title}>{title}</h3>
        <p className="text-xs text-zinc-400 font-mono mt-1">
          Bucket: {bucket}
        </p>
      </div>
      <div className="shrink-0 w-32 flex items-center">
        <span className="text-xs text-zinc-500 bg-[#f7f7f5] px-2 py-1 rounded-md border border-[#e9e9e7]">MP4</span>
      </div>
      <div className="shrink-0 w-24 flex justify-end">
        <StatusBadge status={status} />
      </div>
    </Link>
  )
}

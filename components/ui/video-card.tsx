import { Play } from 'lucide-react'
import { StatusBadge } from './status-badge'
import { CopyButton } from './copy-button'
import Link from 'next/link'

export function VideoCard({ 
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
    <Link href={`/media/${id}`} className="group block bg-white border border-[#e9e9e7] rounded-lg overflow-hidden hover:border-zinc-300 hover:shadow-sm transition-all relative cursor-pointer">
      <div className="aspect-video bg-[#f7f7f5] relative flex items-center justify-center overflow-hidden">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <Play className="w-8 h-8 text-zinc-300" fill="currentColor" />
        )}
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
          {duration}
        </div>
      </div>
      <div className="p-3 overflow-hidden">
        <h3 className="text-sm font-medium text-zinc-800 truncate" title={title}>{title}</h3>
        <div className="flex items-center gap-1 mt-1">
          <p className="text-[10px] text-zinc-500 font-mono truncate" title={id}>
            ID: {id}
          </p>
          <CopyButton text={id} />
        </div>
        <p className="text-xs text-zinc-400 font-mono mt-0.5 mb-2">
          Bucket: {bucket}
        </p>
        <StatusBadge status={status} />
      </div>
    </Link>
  )
}

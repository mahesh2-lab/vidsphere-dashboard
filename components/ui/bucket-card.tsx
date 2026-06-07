

export function BucketCard({
  id,
  name,
  count,
  updatedAt,
  thumbnails = []
}: {
  id: string
  name: string
  count: number
  updatedAt: string
  thumbnails?: string[]
}) {
  return (
    <div className="group block border border-[#e9e9e7] rounded-lg p-4 hover:border-zinc-300 hover:shadow-sm transition-all cursor-pointer bg-white">
      <div className="grid grid-cols-2 gap-0.5 rounded-md overflow-hidden bg-[#f7f7f5] aspect-video">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-[#e9e9e7] relative w-full h-full">
            {thumbnails[i] && (
              <img src={thumbnails[i]} alt="" className="absolute inset-0 w-full h-full object-cover" />
            )}
          </div>
        ))}
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-medium text-zinc-800">{name}</h3>
        <p className="text-xs text-zinc-400 mt-0.5">{count} videos</p>
        <p className="text-[10px] text-zinc-400 font-mono mt-1">Updated {updatedAt}</p>
      </div>
      <div className="flex gap-3 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="text-xs text-zinc-400 hover:text-zinc-700">Rename</button>
        <button className="text-xs text-zinc-400 hover:text-red-500">Delete</button>
      </div>
    </div>
  )
}

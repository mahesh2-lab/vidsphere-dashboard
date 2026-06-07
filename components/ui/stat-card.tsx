export function StatCard({
  label,
  value,
  progress,
}: {
  label: string
  value: React.ReactNode
  progress?: number // 0-100
}) {
  return (
    <div className="border border-[#e9e9e7] rounded-lg p-5 bg-white">
      <div className="text-3xl font-medium text-zinc-900">{value}</div>
      <div className="text-xs text-zinc-400 uppercase tracking-wide mt-2">
        {label}
      </div>
      
      {typeof progress === 'number' && (
        <div className="h-1 bg-[#e9e9e7] rounded mt-3 w-full overflow-hidden">
          <div 
            className="h-full bg-zinc-900 rounded-full" 
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  )
}

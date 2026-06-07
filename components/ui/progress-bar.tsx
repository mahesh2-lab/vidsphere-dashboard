export function ProgressBar({ progress }: { progress: number }) {
  const percentage = Math.min(100, Math.max(0, progress))
  
  let color = 'bg-zinc-900'
  if (percentage >= 95) color = 'bg-red-500'
  else if (percentage >= 80) color = 'bg-amber-500'

  return (
    <div className="h-1.5 bg-[#e9e9e7] rounded overflow-hidden w-full">
      <div 
        className={`h-full rounded-full ${color}`} 
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

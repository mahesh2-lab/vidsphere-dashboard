import { clsx } from 'clsx'

type Status = 'processing' | 'ready' | 'published' | 'failed' | 'active' | 'revoked'

export function StatusBadge({ status, className }: { status: Status | string, className?: string }) {
  let colorClass = 'bg-zinc-100 text-zinc-700'
  
  if (status === 'processing') colorClass = 'bg-yellow-100 text-yellow-700'
  else if (status === 'ready' || status === 'active') colorClass = 'bg-green-100 text-green-700'
  else if (status === 'published') colorClass = 'bg-blue-100 text-blue-700'
  else if (status === 'failed' || status === 'revoked') colorClass = 'bg-red-100 text-red-700'

  return (
    <span className={clsx("text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center whitespace-nowrap", colorClass, className)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

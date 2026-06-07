import { clsx } from 'clsx'

export function Panel({
  title,
  children,
  danger,
}: {
  title: string
  children: React.ReactNode
  danger?: boolean
}) {
  return (
    <div className="border border-[#e9e9e7] rounded-lg overflow-hidden bg-white">
      <div 
        className={clsx(
          "px-4 py-3 border-b border-[#e9e9e7] text-xs font-medium uppercase tracking-wide",
          danger ? "bg-red-50 text-red-400 border-red-100" : "bg-[#f7f7f5] text-zinc-500"
        )}
      >
        {title}
      </div>
      <div className="divide-y divide-[#e9e9e7] flex flex-col">
        {children}
      </div>
    </div>
  )
}

export function ComingSoon({ 
  title, 
  description,
  icon: Icon
}: { 
  title: string
  description: string
  icon: any
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="border border-dashed border-[#e9e9e7] rounded-xl p-16 max-w-md w-full bg-[#f7f7f5]/50">
        <Icon className="w-12 h-12 text-zinc-300 mx-auto mb-6" strokeWidth={1.5} />
        <h2 className="text-xl font-medium text-zinc-900 mb-2">{title}</h2>
        <p className="text-sm text-zinc-500 leading-relaxed">
          {description}
        </p>
        <div className="mt-6 inline-flex bg-zinc-100 text-zinc-500 text-xs px-2.5 py-1 rounded-full uppercase tracking-widest font-medium">
          Coming Soon
        </div>
      </div>
    </div>
  )
}

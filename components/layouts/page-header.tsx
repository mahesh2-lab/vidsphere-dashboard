export function PageHeader({ 
  title, 
  description, 
  children 
}: { 
  title: string
  description?: string
  children?: React.ReactNode 
}) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-medium text-zinc-900">{title}</h1>
        {description && (
          <p className="text-sm text-zinc-400 mt-0.5">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  )
}

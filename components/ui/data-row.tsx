export function DataRow({
  label,
  value,
  children
}: {
  label: string
  value?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="px-4 py-2.5 flex justify-between items-center bg-white hover:bg-[#f7f7f5] transition-colors">
      <span className="text-xs text-zinc-500">{label}</span>
      {value ? (
        <span className="text-sm text-zinc-700 font-mono">{value}</span>
      ) : (
        children
      )}
    </div>
  )
}

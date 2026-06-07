export function TabBar({ 
  tabs, 
  activeTab, 
  onChange 
}: {
  tabs: string[]
  activeTab: string
  onChange: (tab: string) => void
}) {
  return (
    <div className="flex gap-6 border-b border-[#e9e9e7]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`pb-2 text-sm transition-colors ${
              isActive 
                ? 'border-b-2 border-zinc-900 text-zinc-900 font-medium' 
                : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            {tab}
          </button>
        )
      })}
    </div>
  )
}

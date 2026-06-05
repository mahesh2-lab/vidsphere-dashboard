import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      <p className="text-sm font-medium text-gray-500">Loading your data...</p>
    </div>
  )
}

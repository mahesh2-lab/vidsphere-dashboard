import { BarChart3 } from 'lucide-react'
import { ComingSoon } from '@/components/ui/coming-soon'

export default function UsagePage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-zinc-900">API Usage & Logs</h1>
      </div>
      
      <ComingSoon 
        title="Analytics & Logs"
        description="Detailed request logs, error rates, and API usage analytics across all your connected applications."
        icon={BarChart3}
      />
    </div>
  )
}

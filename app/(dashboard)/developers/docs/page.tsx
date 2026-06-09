import { BookOpen } from 'lucide-react'
import { ComingSoon } from '@/components/ui/coming-soon'

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-zinc-900">Documentation</h1>
      </div>
      
      <ComingSoon 
        title="Developer Documentation"
        description="Comprehensive guides, API reference, and SDK documentation for integrating VidSphere into your applications."
        icon={BookOpen}
      />
    </div>
  )
}

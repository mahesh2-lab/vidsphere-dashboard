import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-48 flex flex-col h-screen">
        <Topbar />
        <div className="flex-1 overflow-auto p-8 bg-gray-50">
          {children}
        </div>
      </main>
    </div>
  )
}

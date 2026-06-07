'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Search, ChevronDown, LayoutGrid, List, UploadCloud, ChevronLeft, ChevronRight } from 'lucide-react'
import { VideoCard } from '@/components/ui/video-card'
import { VideoListRow } from '@/components/ui/video-list-row'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// Helper outside component to avoid recreation
const getFormattedDuration = (durationStr: string) => {
  let formattedDuration = ''
  if (durationStr) {
    const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (match) {
      const h = match[1] ? `${match[1]}h ` : ''
      const m = match[2] ? `${match[2]}m ` : ''
      const s = match[3] ? `${match[3]}s` : ''
      formattedDuration = `${h}${m}${s}`.trim()
    }
  }
  return formattedDuration || '0s'
}

export function MediaLibraryView({ initialVideos }: { initialVideos: any[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [formatFilter, setFormatFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false)
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = viewMode === 'grid' ? 15 : 20

  const filteredVideos = useMemo(() => {
    return initialVideos.filter(v => {
      // Search
      const matchesSearch = v.title?.toLowerCase().includes(debouncedSearch.toLowerCase())
      
      // Status
      const status = v.status === 'processed' ? 'ready' : v.status
      const matchesStatus = statusFilter === 'all' || status === statusFilter

      // Format (Mocking everything as MP4 for now)
      const format = 'mp4'
      const matchesFormat = formatFilter === 'all' || format === formatFilter

      return matchesSearch && matchesStatus && matchesFormat
    })
  }, [initialVideos, debouncedSearch, statusFilter, formatFilter])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, statusFilter, formatFilter, viewMode])

  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage)
  
  const paginatedVideos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredVideos.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredVideos, currentPage, itemsPerPage])

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-medium text-zinc-900">Media Library</h1>
          <p className="text-sm text-zinc-400 mt-0.5">{filteredVideos.length} assets</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search videos..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#f7f7f5] border border-[#e9e9e7] rounded-md pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-zinc-400 focus:bg-white transition-colors w-64"
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => {
                setIsFormatDropdownOpen(!isFormatDropdownOpen)
                setIsStatusDropdownOpen(false)
              }}
              className={`flex items-center gap-2 border rounded-md px-3 py-1.5 text-sm transition-colors ${formatFilter !== 'all' ? 'bg-white border-zinc-400 text-zinc-900' : 'bg-[#f7f7f5] border-[#e9e9e7] text-zinc-700 hover:bg-white'}`}
            >
              {formatFilter === 'all' ? 'Format' : formatFilter.toUpperCase()} <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>
            {isFormatDropdownOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white border border-[#e9e9e7] rounded-md shadow-lg z-10 py-1 overflow-hidden">
                <button onClick={() => { setFormatFilter('all'); setIsFormatDropdownOpen(false) }} className="w-full text-left px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50">All Formats</button>
                <button onClick={() => { setFormatFilter('mp4'); setIsFormatDropdownOpen(false) }} className="w-full text-left px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50">MP4</button>
              </div>
            )}
          </div>
          
          <div className="relative">
            <button 
              onClick={() => {
                setIsStatusDropdownOpen(!isStatusDropdownOpen)
                setIsFormatDropdownOpen(false)
              }}
              className={`flex items-center gap-2 border rounded-md px-3 py-1.5 text-sm transition-colors ${statusFilter !== 'all' ? 'bg-white border-zinc-400 text-zinc-900 capitalize' : 'bg-[#f7f7f5] border-[#e9e9e7] text-zinc-700 hover:bg-white'}`}
            >
              {statusFilter === 'all' ? 'Status' : statusFilter} <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>
            {isStatusDropdownOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white border border-[#e9e9e7] rounded-md shadow-lg z-10 py-1 overflow-hidden">
                <button onClick={() => { setStatusFilter('all'); setIsStatusDropdownOpen(false) }} className="w-full text-left px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50">All Status</button>
                <button onClick={() => { setStatusFilter('ready'); setIsStatusDropdownOpen(false) }} className="w-full text-left px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50">Ready</button>
                <button onClick={() => { setStatusFilter('processing'); setIsStatusDropdownOpen(false) }} className="w-full text-left px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50">Processing</button>
              </div>
            )}
          </div>
          
          <div className="flex items-center bg-[#f7f7f5] border border-[#e9e9e7] rounded-md p-0.5 ml-2">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Link href="/upload" className="ml-2 bg-zinc-900 text-white text-sm px-4 py-1.5 rounded-md hover:bg-zinc-700 transition-colors flex items-center gap-2">
            <UploadCloud className="w-4 h-4" />
            Upload
          </Link>
        </div>
      </div>

      {/* Content */}
      {paginatedVideos.length > 0 ? (
        <div className={viewMode === 'grid' ? "grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mt-8" : "flex flex-col gap-2 mt-8"}>
          {paginatedVideos.map((v: any) => {
            const formattedDuration = getFormattedDuration(v.duration)
            const status = v.status === 'processed' ? 'ready' : v.status
            
            if (viewMode === 'grid') {
              return (
                <VideoCard
                  key={v.id}
                  id={v.id}
                  title={v.title || 'Untitled Video'}
                  thumbnailUrl={v.thumbnailUrl || undefined}
                  bucket={v.bucket || 'default'}
                  duration={formattedDuration}
                  status={status}
                />
              )
            } else {
              return (
                <VideoListRow
                  key={v.id}
                  id={v.id}
                  title={v.title || 'Untitled Video'}
                  thumbnailUrl={v.thumbnailUrl || undefined}
                  bucket={v.bucket || 'default'}
                  duration={formattedDuration}
                  status={status}
                />
              )
            }
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 mt-8">
          <div className="border border-dashed border-[#e9e9e7] rounded-xl p-16 max-w-md w-full bg-[#f7f7f5]/50 text-center">
            <UploadCloud className="w-10 h-10 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-zinc-700">No videos found</h3>
            <p className="text-xs text-zinc-400 mt-1 mb-6">
              {initialVideos.length === 0 ? "Upload your first video to get started" : "Try adjusting your search or filters"}
            </p>
            {initialVideos.length > 0 && (
              <button 
                onClick={() => { setSearchQuery(''); setStatusFilter('all'); setFormatFilter('all'); }}
                className="bg-zinc-900 text-white text-sm px-4 py-1.5 rounded-md hover:bg-zinc-700 transition-colors inline-block"
              >
                Clear filters
              </button>
            )}
            {initialVideos.length === 0 && (
              <Link href="/upload" className="bg-zinc-900 text-white text-sm px-4 py-1.5 rounded-md hover:bg-zinc-700 transition-colors inline-block">
                Upload video
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredVideos.length > 0 && (
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-[#e9e9e7]">
          <span className="text-sm text-zinc-400">
            Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredVideos.length)} of {filteredVideos.length}
          </span>
          <div className="flex gap-1">
            <button 
              className={`flex items-center gap-1 text-sm px-2.5 py-1 rounded transition-colors ${currentPage === 1 ? 'text-zinc-300 cursor-not-allowed' : 'text-zinc-500 hover:bg-[#f7f7f5]'}`}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-3 h-3" /> Prev
            </button>
            
            <span className="text-sm px-3 py-1 text-zinc-700">Page {currentPage} of {totalPages}</span>
            
            <button 
              className={`flex items-center gap-1 text-sm px-2.5 py-1 rounded transition-colors ${currentPage === totalPages ? 'text-zinc-300 cursor-not-allowed' : 'text-zinc-500 hover:bg-[#f7f7f5]'}`}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

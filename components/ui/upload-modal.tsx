'use client'

import { useState } from 'react'
import { UploadCloud, X, CheckCircle2 } from 'lucide-react'

export function UploadModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean
  onClose: () => void 
}) {
  const [state, setState] = useState<'idle' | 'uploading' | 'complete'>('idle')
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-[#e9e9e7] shadow-lg max-w-lg w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
        >
          <X size={16} />
        </button>

        {state === 'idle' && (
          <div 
            className="border border-dashed border-[#e9e9e7] rounded-xl p-12 text-center hover:bg-[#f7f7f5] hover:border-zinc-300 transition-colors cursor-pointer"
            onClick={() => {
              setState('uploading')
              setTimeout(() => setState('complete'), 2000)
            }}
          >
            <UploadCloud className="w-8 h-8 text-zinc-300 mx-auto" />
            <h3 className="text-sm font-medium text-zinc-700 mt-3">Drop your video here</h3>
            <p className="text-xs text-zinc-400 mt-1">or click to browse</p>
            <p className="text-xs text-zinc-300 mt-3">MP4, MOV, AVI, MKV, WebM &middot; Max 10 GB</p>
          </div>
        )}

        {state === 'uploading' && (
          <div className="py-8">
            <h3 className="text-sm font-medium text-zinc-800">marketing-hero.mp4</h3>
            <p className="text-xs text-zinc-400 font-mono mt-1">142.3 MB</p>
            <div className="h-1.5 bg-[#e9e9e7] rounded mt-3 w-full overflow-hidden">
              <div className="h-full bg-zinc-900 rounded-full w-[67%] transition-all duration-500" />
            </div>
            <div className="flex justify-between items-center mt-1.5">
              <p className="text-xs text-zinc-400 font-mono">67%  &middot;  1.2 MB/s</p>
              <button 
                onClick={() => setState('idle')}
                className="text-xs text-zinc-400 hover:text-red-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {state === 'complete' && (
          <div className="py-12 text-center">
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto" />
            <h3 className="text-sm font-medium text-zinc-800 mt-3">Upload complete</h3>
            <button 
              onClick={onClose}
              className="text-xs text-blue-500 hover:underline mt-2 inline-block"
            >
              View asset &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

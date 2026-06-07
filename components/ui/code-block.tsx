'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group bg-[#f7f7f5] border border-[#e9e9e7] rounded-lg p-4">
      <button 
        onClick={handleCopy}
        className="absolute top-3 right-3 p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-[#e9e9e7] transition-colors"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
      <pre className="font-mono text-sm text-zinc-700 whitespace-pre-wrap pr-10">
        {code}
      </pre>
    </div>
  )
}

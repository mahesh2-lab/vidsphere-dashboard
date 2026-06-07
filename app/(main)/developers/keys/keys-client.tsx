'use client'

import { useState, useEffect } from 'react'
import { Key, Plus, Trash2, AlertTriangle, Copy, Check, RefreshCw } from 'lucide-react'
import { StatusBadge } from '@/components/ui/status-badge'
import Link from 'next/link'

type ApiKey = {
  id: string
  name: string
  prefix: string
  revokedAt: string | null
  lastUsedAt: string | null
  createdAt: string
}

export function KeysClient({ hasChannel }: { hasChannel: boolean }) {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showNoChannelAlert, setShowNoChannelAlert] = useState(false)
  const [keyToRevoke, setKeyToRevoke] = useState<string | null>(null)
  const [newKeyName, setNewKeyName] = useState('')

  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchKeys = async () => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/keys')
      if (!res.ok) throw new Error('Failed to load API keys')
      const data = await res.json()
      setKeys(data.keys || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchKeys()
  }, [])

  const handleCreate = async () => {
    if (!newKeyName.trim()) return
    setIsGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create key')
      }
      const data = await res.json()
      setGeneratedKey(data.key)
      setShowCreateModal(false)
      setNewKeyName('')
      fetchKeys()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const executeRevoke = async () => {
    if (!keyToRevoke) return
    const id = keyToRevoke
    setRevokingId(id)
    setKeyToRevoke(null)
    try {
      const res = await fetch(`/api/keys/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to revoke key')
      }
      fetchKeys()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setRevokingId(null)
    }
  }

  const copyToClipboard = () => {
    if (!generatedKey) return
    navigator.clipboard.writeText(generatedKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-medium text-zinc-900">Your API Keys</h2>
        <button
          onClick={() => {
            if (!hasChannel) {
              setShowNoChannelAlert(true)
              return
            }
            setShowCreateModal(true)
          }}
          className="flex items-center gap-2 bg-zinc-900 text-white text-sm px-4 py-1.5 rounded-md hover:bg-zinc-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Generate New Key
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md text-sm border border-red-100 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Generated Key Modal/Alert */}
      {generatedKey && (
        <div className="mb-8 p-6 bg-[#f7f7f5] border border-[#e9e9e7] rounded-lg">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-white border border-[#e9e9e7] flex items-center justify-center flex-shrink-0">
              <Key className="w-5 h-5 text-zinc-900" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-zinc-900 mb-1">Save your new API key</h3>
              <p className="text-xs text-zinc-500 mb-4">
                This is the only time your API key will be shown. Please copy it and store it somewhere safe. You will not be able to see it again.
              </p>
              <div className="flex items-center gap-3 bg-white border border-[#e9e9e7] rounded-md p-2 pl-3">
                <code className="text-sm text-zinc-700 font-mono flex-1 break-all select-all">
                  {generatedKey}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-[#f7f7f5] rounded transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setGeneratedKey(null)}
                  className="text-xs font-medium text-zinc-700 hover:text-zinc-900 bg-white border border-[#e9e9e7] hover:bg-[#f7f7f5] px-4 py-1.5 rounded-md transition-colors"
                >
                  I have saved it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keys Table */}
      <div className="bg-white border border-[#e9e9e7] rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="py-12 flex justify-center items-center">
            <RefreshCw className="w-5 h-5 text-zinc-300 animate-spin" />
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-16 bg-[#f7f7f5]/50">
            <Key className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-zinc-700 mb-1">No API keys</h3>
            <p className="text-xs text-zinc-400">You haven't generated any API keys yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f7f7f5] text-xs font-medium text-zinc-500 uppercase tracking-wide border-b border-[#e9e9e7]">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Key Prefix</th>
                <th className="px-5 py-3 font-medium">Created</th>
                <th className="px-5 py-3 font-medium">Last Used</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e9e9e7]">
              {keys.map((key) => (
                <tr key={key.id} className="hover:bg-[#f7f7f5] transition-colors">
                  <td className="px-5 py-3 text-zinc-900">{key.name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-zinc-500">{key.prefix}••••••••••••••••••••••••</td>
                  <td className="px-5 py-3 text-zinc-500 whitespace-nowrap">
                    {new Date(key.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-zinc-500 whitespace-nowrap">
                    {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={key.revokedAt ? 'revoked' : 'active'} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    {!key.revokedAt && (
                      <button
                        onClick={() => setKeyToRevoke(key.id)}
                        disabled={revokingId === key.id}
                        className="text-zinc-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
                        title="Revoke Key"
                      >
                        {revokingId === key.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-[#e9e9e7] w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-medium text-zinc-900 mb-2">Generate API Key</h3>
              <p className="text-xs text-zinc-500 mb-6">
                Give your API key a descriptive name so you remember what it's used for.
              </p>

              <div className="space-y-2 mb-6">
                <label className="block text-xs font-medium text-zinc-700 uppercase tracking-wide">Key Name</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Production API"
                  className="w-full px-3 py-2 bg-[#f7f7f5] border border-[#e9e9e7] rounded-md focus:outline-none focus:border-zinc-400 focus:bg-white transition-colors text-sm text-zinc-900"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-1.5 text-sm text-zinc-600 bg-white border border-[#e9e9e7] rounded-md hover:bg-[#f7f7f5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newKeyName.trim() || isGenerating}
                  className="px-4 py-1.5 text-sm text-white bg-zinc-900 rounded-md hover:bg-zinc-700 disabled:opacity-50 transition-colors flex items-center"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating
                    </>
                  ) : (
                    'Generate'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Channel Alert Modal */}
      {showNoChannelAlert && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-[#e9e9e7] w-full max-w-md overflow-hidden p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-4" />
            <h3 className="text-base font-medium text-zinc-900 mb-2">YouTube Channel Required</h3>
            <p className="text-sm text-zinc-500 mb-6">
              You must connect your YouTube channel from the Settings page before you can generate API keys.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowNoChannelAlert(false)}
                className="px-4 py-1.5 text-sm text-zinc-600 bg-white border border-[#e9e9e7] rounded-md hover:bg-[#f7f7f5] transition-colors"
              >
                Cancel
              </button>
              <Link
                href="/settings"
                className="px-4 py-1.5 text-sm text-white bg-zinc-900 rounded-md hover:bg-zinc-700 transition-colors"
              >
                Go to Settings
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Confirmation Modal */}
      {keyToRevoke && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg border border-[#e9e9e7] w-full max-w-md overflow-hidden p-6 text-center">
            <Trash2 className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <h3 className="text-base font-medium text-zinc-900 mb-2">Revoke API Key</h3>
            <p className="text-sm text-zinc-500 mb-6">
              Are you sure you want to revoke this API key? Any applications using this key will immediately lose access. This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setKeyToRevoke(null)}
                className="px-4 py-1.5 text-sm text-zinc-600 bg-white border border-[#e9e9e7] rounded-md hover:bg-[#f7f7f5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeRevoke}
                className="px-4 py-1.5 text-sm text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
              >
                Revoke
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

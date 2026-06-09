'use client'

import { useState } from 'react'
import { Save, Unlink, RefreshCw, User, Mail, Camera, MonitorPlay } from 'lucide-react'
import { disconnectYouTubeChannel } from '@/features/youtube/actions/youtube'
import { useRouter } from 'next/navigation'
import { updateUser } from '@/lib/auth/auth-client'

export function SettingsClient({ channel, user }: { channel: any, user: any }) {
  const router = useRouter()
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [isUpdatingUser, setIsUpdatingUser] = useState(false)
  const [updateMessage, setUpdateMessage] = useState('')

  const handleUpdateUser = async () => {
    setIsUpdatingUser(true)
    setUpdateMessage('')
    try {
      await updateUser({ name })
      setUpdateMessage('Profile updated successfully!')
      setTimeout(() => setUpdateMessage(''), 3000)
    } catch (e: any) {
      setUpdateMessage(e.message || 'Failed to update profile')
    } finally {
      setIsUpdatingUser(false)
    }
  }

  const handleDisconnect = async () => {
    if (confirm("Are you sure you want to disconnect your YouTube channel? This will remove all synced data.")) {
      setIsDisconnecting(true)
      try {
        await disconnectYouTubeChannel()
        // Wait for revalidation
      } catch (e) {
        console.error(e)
      } finally {
        setIsDisconnecting(false)
      }
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Profile Section */}
      <div className="bg-white border border-[#e9e9e7] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e9e9e7] bg-[#f7f7f5]">
          <h2 className="text-sm font-medium text-zinc-900">User Profile</h2>
        </div>
        <div className="p-6">
          <div className="flex gap-8">
            {/* Avatar */}
            <div className="flex flex-col items-center space-y-3 shrink-0">
              <div className="relative group cursor-pointer">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name || 'User'}
                    className="w-20 h-20 rounded-full object-cover border border-[#e9e9e7] bg-[#f7f7f5]"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#f7f7f5] text-zinc-400 flex items-center justify-center text-2xl font-medium border border-[#e9e9e7]">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-medium">Avatar</p>
            </div>

            {/* Form */}
            <div className="flex-1 space-y-5">
              <div>
                <label className="block text-xs font-medium text-zinc-700 uppercase tracking-wide mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-zinc-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#f7f7f5] border border-[#e9e9e7] rounded-md focus:outline-none focus:border-zinc-400 focus:bg-white transition-colors text-sm text-zinc-900"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 uppercase tracking-wide mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-zinc-400" />
                  </div>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-[#e9e9e7] rounded-md text-sm text-zinc-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-zinc-400 mt-2">Email cannot be changed.</p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={handleUpdateUser}
                  disabled={isUpdatingUser || name === user?.name}
                  className="flex items-center gap-2 bg-zinc-900 text-white text-sm px-4 py-1.5 rounded-md hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                >
                  {isUpdatingUser ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isUpdatingUser ? 'Saving...' : 'Save Changes'}
                </button>

                {updateMessage && (
                  <span className={`text-xs font-medium ${updateMessage.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>
                    {updateMessage}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integrations Section */}
      <div className="bg-white border border-[#e9e9e7] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e9e9e7] bg-[#f7f7f5]">
          <h2 className="text-sm font-medium text-zinc-900">Integrations</h2>
        </div>
        <div className="p-6">
          {channel ? (
            <div className="flex items-center justify-between p-4 bg-white border border-[#e9e9e7] rounded-lg">
              <div className="flex items-center gap-4">
                {channel.thumbnailUrl ? (
                  <img
                    src={channel.thumbnailUrl}
                    alt={channel.channelName}
                    className="w-10 h-10 rounded-full border border-[#e9e9e7]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                    <MonitorPlay className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-zinc-900 flex items-center gap-2">
                    {channel.channelName}
                    <span className="bg-green-50 text-green-600 text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded font-medium">Connected</span>
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">YouTube Account</p>
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-600 border border-[#e9e9e7] rounded-md hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                {isDisconnecting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Unlink className="w-3 h-3" />}
                {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-white border border-[#e9e9e7] rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f7f7f5] text-zinc-400 flex items-center justify-center border border-[#e9e9e7]">
                  <MonitorPlay className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900">YouTube Channel</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Connect your YouTube channel to sync videos</p>
                </div>
              </div>
              <a 
                href="/api/youtube/connect" 
                className="flex items-center gap-2 bg-red-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-red-700 transition-colors"
              >
                Connect
              </a>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

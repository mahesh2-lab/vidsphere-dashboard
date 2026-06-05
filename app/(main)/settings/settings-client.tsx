'use client'

import { useState } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { Save, Unlink, RefreshCw, User, Mail, Camera } from 'lucide-react'
import { disconnectYouTubeChannel } from '@/app/actions/youtube'
import { useRouter } from 'next/navigation'
import { updateUser } from '@/lib/auth-client'

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
    <div className="space-y-8 max-w-2xl">
      {/* User Profile Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">User Profile</h2>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative group cursor-pointer">
              {user?.image ? (
                <img 
                  src={user.image} 
                  alt={user.name || 'User'} 
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-3xl font-bold border-2 border-red-200 shadow-sm">
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">Avatar</p>
          </div>

          <div className="flex-1 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors"
                  placeholder="Your name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="pl-10 w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button 
                onClick={handleUpdateUser}
                disabled={isUpdatingUser || name === user?.name}
                className={buttonVariants({ variant: 'default', className: "bg-red-600 hover:bg-red-700" })}
              >
                {isUpdatingUser ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {isUpdatingUser ? 'Saving...' : 'Update Profile'}
              </button>
              
              {updateMessage && (
                <span className={`text-sm font-medium ${updateMessage.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                  {updateMessage}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Channel Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Channel Settings</h2>
        
        {channel ? (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-4">
              {channel.thumbnailUrl && (
                <img 
                  src={channel.thumbnailUrl} 
                  alt={channel.channelName} 
                  className="w-12 h-12 rounded-full border border-gray-200 shadow-sm"
                />
              )}
              <div>
                <p className="font-medium text-gray-900 text-lg">{channel.channelName}</p>
                <p className="text-sm text-gray-500">Connected Account</p>
              </div>
            </div>
            <button 
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className={buttonVariants({ variant: 'outline', className: "text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300" })}
            >
              {isDisconnecting ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Unlink className="w-4 h-4 mr-2" />}
              {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">YouTube Channel</p>
                <p className="text-sm text-gray-600 mt-1">Connect your YouTube channel</p>
              </div>
              <a href="/api/youtube/connect" className={buttonVariants({ variant: 'default', className: "bg-red-600 hover:bg-red-700" })}>
                Connect with Google
              </a>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

import { SettingsClient } from './settings-client'
import { getUserChannel } from '@/features/youtube/actions/youtube'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const channel = await getUserChannel()

  return (
    <div className="max-w-5xl mx-auto py-8 px-10">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-zinc-900">Account Settings</h1>
        <p className="text-sm text-zinc-400 mt-1">Manage your profile and connected integrations.</p>
      </div>
      
      <SettingsClient channel={channel} user={session.user} />
    </div>
  )
}

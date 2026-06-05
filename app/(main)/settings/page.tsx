import { SettingsClient } from './settings-client'
import { getUserChannel } from '@/app/actions/youtube'
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
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
      <SettingsClient channel={channel} user={session.user} />
    </>
  )
}

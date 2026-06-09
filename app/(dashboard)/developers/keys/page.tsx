import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getUserChannel } from '@/features/youtube/actions/youtube'
import { KeysClient } from './keys-client'

export default async function DevelopersKeysPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const channel = await getUserChannel()

  return (
    <div className="max-w-5xl mx-auto py-8 px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-zinc-900">API Keys</h1>
        <p className="text-sm text-zinc-400 mt-1">Manage programmatic access to your VidSphere resources.</p>
      </div>

      <KeysClient hasChannel={!!channel} />
    </div>
  )
}

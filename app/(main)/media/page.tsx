import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getUserChannel, getUserVideos } from '@/app/actions/youtube'
import { MediaLibraryView } from '@/components/ui/media-library-view'

export default async function MediaPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const channel = await getUserChannel()
  const videos = channel ? await getUserVideos() : []

  return (
    <div className="max-w-7xl mx-auto py-8 px-10">
      <MediaLibraryView initialVideos={videos} />
    </div>
  )
}

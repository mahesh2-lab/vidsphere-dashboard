import Link from 'next/link'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { buttonVariants } from '@/components/ui/button'
import { Play, BarChart3, UploadCloud, ShieldCheck } from 'lucide-react'

export default async function LandingPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold">
              YT
            </div>
            <span className="font-semibold text-xl text-gray-900 tracking-tight">VidSphere</span>
          </div>
          <div>
            {session?.user ? (
              <Link href="/dashboard" className={buttonVariants({ variant: 'default' })}>
                Go to Dashboard
              </Link>
            ) : (
              <Link href="/sign-in" className={buttonVariants({ variant: 'default' })}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
          The Ultimate <span className="text-red-600">VidSphere</span>
        </h1>
        <p className="max-w-2xl text-xl text-gray-600 mb-10 leading-relaxed">
          Securely connect your YouTube channel to view advanced real-time analytics, manage your video library, and streamline your content workflow all in one place.
        </p>

        <div className="flex gap-4 justify-center mb-20">
          <Link href={session?.user ? "/dashboard" : "/sign-up"} className={buttonVariants({ variant: 'default', size: 'lg', className: 'text-lg px-8 py-6' })}>
            {session?.user ? 'Go to Dashboard' : 'Get Started for Free'}
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-left">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Advanced Analytics</h3>
            <p className="text-gray-600 text-sm">
              View your live subscriber count, total channel views, and track your channel's growth seamlessly using official YouTube API integrations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-4">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Manage Uploads</h3>
            <p className="text-gray-600 text-sm">
              Keep track of your entire video library, view recent comments, and streamline your next video upload directly from the dashboard.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Transparent Data Usage</h3>
            <p className="text-gray-600 text-sm">
              VidSphere requests access to your YouTube account solely to read your channel statistics, fetch your uploaded videos, and allow you to upload new content directly from the dashboard. We do not sell your data or use it for any other purpose.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} VidSphere. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link href="/privacy" className="text-gray-500 hover:text-gray-900">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-gray-900">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

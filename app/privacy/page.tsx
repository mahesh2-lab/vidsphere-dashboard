import Link from 'next/link'

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6 sm:px-8">
      <Link href="/" className="text-sm text-red-600 hover:text-red-700 font-medium mb-8 inline-block">
        &larr; Back to Home
      </Link>
      
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
      <p className="text-gray-500 mb-12">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
          <p>
            Welcome to VidSphere. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you about how we look after your personal data when you visit our website 
            and use our application, and tell you about your privacy rights.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. YouTube API Services</h2>
          <p className="mb-4">
            Our application uses YouTube API Services to provide features such as displaying your channel statistics 
            and managing your videos. By using our application, you are agreeing to be bound by the{' '}
            <a href="https://www.youtube.com/t/terms" target="_blank" rel="noreferrer" className="text-red-600 hover:underline">
              YouTube Terms of Service
            </a>.
          </p>
          <p>
            For more information regarding how Google handles your data, please review the{' '}
            <a href="http://www.google.com/policies/privacy" target="_blank" rel="noreferrer" className="text-red-600 hover:underline">
              Google Privacy Policy
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information We Collect</h2>
          <p className="mb-4">
            When you connect your YouTube channel to our application, we collect and store:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your Google account email address and basic profile information.</li>
            <li>Your YouTube channel ID, name, and profile thumbnail.</li>
            <li>OAuth access and refresh tokens used to make authenticated requests on your behalf.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Use Your Information</h2>
          <p className="mb-4">
            We use the collected information strictly for the functional purposes of the dashboard:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To retrieve and display your YouTube channel statistics and video analytics.</li>
            <li>To manage your videos (if you explicitly grant upload/management permissions).</li>
            <li>To maintain your session and authenticate you upon return visits.</li>
          </ul>
          <p className="mt-4 font-semibold">We do not sell, rent, or share your personal information with third parties for their marketing purposes.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Revoking Access</h2>
          <p>
            You can revoke our application's access to your YouTube data at any time via your Google Account's security settings page at:{' '}
            <a href="https://security.google.com/settings/security/permissions" target="_blank" rel="noreferrer" className="text-red-600 hover:underline">
              Google Security Settings
            </a>. Upon revoking access, our application will no longer be able to access your YouTube data.
          </p>
        </section>
      </div>
    </div>
  )
}

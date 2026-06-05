import Link from 'next/link'

export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6 sm:px-8">
      <Link href="/" className="text-sm text-red-600 hover:text-red-700 font-medium mb-8 inline-block">
        &larr; Back to Home
      </Link>
      
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
      <p className="text-gray-500 mb-12">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the VidSphere application ("Service"), you agree to be bound by these 
            Terms of Service. If you disagree with any part of the terms, then you may not access the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">2. YouTube API Services</h2>
          <p>
            Our Service uses YouTube API Services. By using our Service, you also agree to be bound by the{' '}
            <a href="https://www.youtube.com/t/terms" target="_blank" rel="noreferrer" className="text-red-600 hover:underline">
              YouTube Terms of Service
            </a>. Please review their terms carefully before using our integration.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Responsibilities</h2>
          <p className="mb-4">When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You are responsible for safeguarding the password that you use to access the Service.</li>
            <li>You agree not to disclose your password to any third party.</li>
            <li>You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are and will remain the exclusive property of 
            VidSphere and its licensors. The Service is protected by copyright, trademark, and other laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, 
            including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 
            30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>
        </section>
      </div>
    </div>
  )
}

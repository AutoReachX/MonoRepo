import TwitterOAuthTest from '@/components/TwitterOAuthTest';

export default function TwitterOAuthTestPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Twitter OAuth Test Page
          </h1>
          <p className="text-gray-600">
            Test your Twitter OAuth integration for AutoReach
          </p>
        </div>
        
        <TwitterOAuthTest />
        
        <div className="mt-8 text-center">
          <a 
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

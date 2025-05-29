import Link from 'next/link';
import ConnectionTest from '@/components/ConnectionTest';

export default function TestConnectionPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            AutoReach Connection Test
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            This page tests the connection between the Next.js frontend and FastAPI backend.
            Use this to verify that your setup is working correctly.
          </p>
        </div>

        <ConnectionTest />

        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Setup Instructions
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-700">
                  🔧 Backend Setup
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="bg-gray-50 p-3 rounded font-mono">
                    cd backend<br/>
                    .\venv\Scripts\Activate.ps1<br/>
                    uvicorn app.main:app --reload
                  </div>
                  <p>Backend should be running on <strong>http://localhost:8000</strong></p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-700">
                  ⚛️ Frontend Setup
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="bg-gray-50 p-3 rounded font-mono">
                    cd frontend<br/>
                    npm run dev
                  </div>
                  <p>Frontend should be running on <strong>http://localhost:3000</strong></p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
        
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Frontend-Backend Connection Test
          </h2>
          <p className="text-gray-600 mb-4">
            Basic connection test page is working! 🎉
          </p>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">✅ Frontend Status</h3>
              <div className="text-sm text-green-600 space-y-1">
                <div>Frontend URL: http://localhost:3001</div>
                <div>Next.js: Running with Turbopack</div>
                <div>Routing: ✅ Working</div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">🔗 Backend Links</h3>
              <div className="text-sm text-blue-600 space-y-1">
                <div>Backend URL: http://localhost:8000</div>
                <div>API Health: <a href="http://localhost:8000/health" className="underline" target="_blank" rel="noopener noreferrer">Test Health Endpoint</a></div>
                <div>API Docs: <a href="http://localhost:8000/docs" className="underline" target="_blank" rel="noopener noreferrer">View API Documentation</a></div>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">🧪 Manual Testing</h3>
              <div className="text-sm text-yellow-600 space-y-1">
                <div>• Click the links above to test backend connectivity</div>
                <div>• Check the API documentation for available endpoints</div>
                <div>• Use the command line tests: npm run test:quick</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <a 
              href="/" 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </div>
        
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
                  <p>Frontend should be running on <strong>http://localhost:3001</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

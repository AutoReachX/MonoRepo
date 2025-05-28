// import ConnectionTest from '../../components/ConnectionTest';

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
            Connection test component temporarily disabled due to compilation issues.
          </p>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Manual Testing</h3>
            <div className="text-sm text-blue-600 space-y-1">
              <div>Backend URL: http://localhost:8000</div>
              <div>Frontend URL: http://localhost:3001</div>
              <div>API Health: <a href="http://localhost:8000/health" className="underline" target="_blank" rel="noopener noreferrer">Test Health Endpoint</a></div>
              <div>API Docs: <a href="http://localhost:8000/docs" className="underline" target="_blank" rel="noopener noreferrer">View API Documentation</a></div>
            </div>
          </div>
        </div>

        {/* <ConnectionTest /> */}

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
                    python -m venv venv<br/>
                    venv/Scripts/activate<br/>
                    pip install -r requirements.txt<br/>
                    python start_server.py
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
                    npm install<br/>
                    npm run dev
                  </div>
                  <p>Frontend should be running on <strong>http://localhost:3000</strong></p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-blue-800">
                🧪 Automated Testing
              </h3>
              <p className="text-blue-700 mb-3">
                For comprehensive testing, run the automated test suite:
              </p>
              <div className="bg-blue-100 p-3 rounded font-mono text-sm text-blue-800">
                npm install  # Install test dependencies<br/>
                npm test     # Run full test suite<br/>
                npm run test:quick  # Quick connection test
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-yellow-800">
                ⚠️ Common Issues
              </h3>
              <ul className="text-yellow-700 space-y-1 text-sm">
                <li>• <strong>CORS errors:</strong> Check backend CORS configuration</li>
                <li>• <strong>Connection refused:</strong> Ensure backend is running on port 8000</li>
                <li>• <strong>API URL mismatch:</strong> Check .env.local file</li>
                <li>• <strong>Authentication fails:</strong> Check database connection</li>
              </ul>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-green-800">
                📚 Resources
              </h3>
              <ul className="text-green-700 space-y-1 text-sm">
                <li>• <strong>API Documentation:</strong> <a href="http://localhost:8000/docs" className="underline" target="_blank" rel="noopener noreferrer">http://localhost:8000/docs</a></li>
                <li>• <strong>Backend Health:</strong> <a href="http://localhost:8000/health" className="underline" target="_blank" rel="noopener noreferrer">http://localhost:8000/health</a></li>
                <li>• <strong>Connection Guide:</strong> See CONNECTION-TESTING.md</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

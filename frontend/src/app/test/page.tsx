import Header from '@/components/Header';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Simple Test Page
        </h1>
        <p className="text-lg text-gray-600">
          This is a simple test page to verify routing is working.
        </p>

        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Connection Status</h2>
          <div className="space-y-2">
            <div>Frontend: ✅ Running on http://localhost:3001</div>
            <div>Backend: <a href="http://localhost:8000/health" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Test Backend Health</a></div>
            <div>API Docs: <a href="http://localhost:8000/docs" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">View API Documentation</a></div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

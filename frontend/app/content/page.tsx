import Header from '@/components/Header';
import ContentGeneration from '@/components/ContentGeneration';

export default function Content() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Content</h1>
          <p className="text-gray-600 mt-2">Generate and manage your Twitter content with AI.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Content Generation */}
          <div>
            <ContentGeneration />
          </div>

          {/* Recent Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Content</h2>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Published
                  </span>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>
                <p className="text-gray-900 mb-2">
                  Just discovered an amazing new AI tool that&apos;s revolutionizing content creation! 🚀
                  The future of marketing is here. #AI #Marketing #Innovation
                </p>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span>❤️ 24</span>
                  <span>🔄 8</span>
                  <span>💬 3</span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Scheduled
                  </span>
                  <span className="text-sm text-gray-500">Tomorrow 9:00 AM</span>
                </div>
                <p className="text-gray-900 mb-2">
                  Monday motivation: Success isn&apos;t just about what you accomplish in your life,
                  it&apos;s about what you inspire others to do. 💪 #MondayMotivation #Success
                </p>
                <div className="flex space-x-2">
                  <button className="text-sm text-primary-600 hover:text-primary-700">Edit</button>
                  <button className="text-sm text-red-600 hover:text-red-700">Delete</button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Draft
                  </span>
                  <span className="text-sm text-gray-500">1 day ago</span>
                </div>
                <p className="text-gray-900 mb-2">
                  The key to effective social media marketing is consistency and authenticity.
                  Here are 5 tips to improve your engagement... 🧵
                </p>
                <div className="flex space-x-2">
                  <button className="text-sm text-primary-600 hover:text-primary-700">Edit</button>
                  <button className="text-sm text-green-600 hover:text-green-700">Schedule</button>
                  <button className="text-sm text-red-600 hover:text-red-700">Delete</button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Published
                  </span>
                  <span className="text-sm text-gray-500">2 days ago</span>
                </div>
                <p className="text-gray-900 mb-2">
                  Building a personal brand takes time, but the results are worth it.
                  Focus on providing value and being genuine. #PersonalBrand #Growth
                </p>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span>❤️ 42</span>
                  <span>🔄 15</span>
                  <span>💬 7</span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All Content
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

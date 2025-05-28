import Header from '@/components/Header';

export default function Analytics() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">Track your Twitter growth and engagement metrics.</p>
        </div>

        {/* Time Period Selector */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md">
              Last 7 days
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Last 30 days
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Last 90 days
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Followers</p>
                <p className="text-3xl font-bold text-gray-900">2,847</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  +12% (342 new)
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                <p className="text-3xl font-bold text-gray-900">4.2%</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  +0.5%
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Impressions</p>
                <p className="text-3xl font-bold text-gray-900">45.2K</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  +18% (6.8K)
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Posts Published</p>
                <p className="text-3xl font-bold text-gray-900">28</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  +8% (2 more)
                </p>
              </div>
              <div className="w-12 h-12 bg-twitter-light-blue rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-twitter-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Follower Growth</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart placeholder - Follower growth over time</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Chart placeholder - Likes, retweets, comments</p>
            </div>
          </div>
        </div>

        {/* Top Performing Posts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Posts</h3>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-500">3 days ago</span>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>❤️ 156</span>
                  <span>🔄 42</span>
                  <span>💬 18</span>
                  <span>👁️ 2.3K</span>
                </div>
              </div>
              <p className="text-gray-900">
                Just discovered an amazing new AI tool that's revolutionizing content creation! 🚀 
                The future of marketing is here. #AI #Marketing #Innovation
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-500">5 days ago</span>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>❤️ 89</span>
                  <span>🔄 23</span>
                  <span>💬 12</span>
                  <span>👁️ 1.8K</span>
                </div>
              </div>
              <p className="text-gray-900">
                Building a personal brand takes time, but the results are worth it. 
                Focus on providing value and being genuine. #PersonalBrand #Growth
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-500">1 week ago</span>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>❤️ 67</span>
                  <span>🔄 19</span>
                  <span>💬 8</span>
                  <span>👁️ 1.5K</span>
                </div>
              </div>
              <p className="text-gray-900">
                Monday motivation: Success isn't just about what you accomplish in your life, 
                it's about what you inspire others to do. 💪 #MondayMotivation #Success
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

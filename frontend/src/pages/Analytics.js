import React from 'react';

const Analytics = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
      
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Growth Overview</h2>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Chart placeholder - Integration with charting library needed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Tweets</h3>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-800">"Just launched our new feature! 🚀"</p>
              <p className="text-xs text-gray-500 mt-1">1,234 likes • 567 retweets</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-800">"Tips for growing your Twitter audience..."</p>
              <p className="text-xs text-gray-500 mt-1">987 likes • 432 retweets</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Audience Insights</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Most active time:</span>
              <span className="text-sm font-medium">2:00 PM - 4:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Top location:</span>
              <span className="text-sm font-medium">United States</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg. engagement rate:</span>
              <span className="text-sm font-medium">8.7%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

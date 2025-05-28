import React from 'react';

const Content = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
        <button className="btn-primary">
          Create New Post
        </button>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Scheduled Posts</h2>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-gray-800">"Excited to share our latest update! 🎉"</p>
                <p className="text-sm text-gray-500 mt-1">Scheduled for: Today, 2:00 PM</p>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-gray-800">"Check out these amazing growth tips..."</p>
                <p className="text-sm text-gray-500 mt-1">Scheduled for: Tomorrow, 10:00 AM</p>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Ideas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900">Industry Trends</h3>
            <p className="text-sm text-blue-700 mt-1">Share insights about the latest trends in your industry</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-900">Behind the Scenes</h3>
            <p className="text-sm text-green-700 mt-1">Show your audience what happens behind the scenes</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-purple-900">User Generated Content</h3>
            <p className="text-sm text-purple-700 mt-1">Retweet and engage with your community's content</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-medium text-yellow-900">Educational Content</h3>
            <p className="text-sm text-yellow-700 mt-1">Share tips, tutorials, and educational resources</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;

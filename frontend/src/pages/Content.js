import React, { useState } from 'react';

const Content = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('engaging');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateContent = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      // This would call your API
      // const response = await fetch('/api/content/generate-tweet', { ... });
      // For now, simulate API call
      setTimeout(() => {
        setGeneratedContent(`🚀 Exciting insights about ${topic}! This AI-generated tweet showcases the power of automation in social media. #${topic.replace(/\s+/g, '')} #AI #SocialMedia`);
        setIsGenerating(false);
      }, 2000);
    } catch (error) {
      console.error('Generation failed:', error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'generate' ? 'btn-primary' : 'btn-secondary'}`}
          >
            AI Generate
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'scheduled' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Scheduled Posts
          </button>
        </div>
      </div>

      {activeTab === 'generate' && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Content Generation</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic or Theme
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="input-field"
                placeholder="e.g., AI in marketing, productivity tips, startup advice"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="input-field"
              >
                <option value="engaging">Engaging</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="educational">Educational</option>
                <option value="humorous">Humorous</option>
              </select>
            </div>

            <button
              onClick={handleGenerateContent}
              disabled={!topic.trim() || isGenerating}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                '✨ Generate Content'
              )}
            </button>

            {generatedContent && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">Generated Content:</h3>
                <p className="text-blue-800 mb-4">{generatedContent}</p>
                <div className="flex space-x-2">
                  <button className="btn-primary text-sm">Schedule Post</button>
                  <button className="btn-secondary text-sm">Post Now</button>
                  <button
                    onClick={() => setGeneratedContent('')}
                    className="btn-secondary text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'scheduled' && (
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
      )}

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

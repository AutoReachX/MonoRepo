import React, { useState } from 'react';
import { useContentGeneration } from '../hooks/useContentGeneration';
import ContentGenerationForm from '../components/ContentGeneration/ContentGenerationForm';
import GeneratedContentDisplay from '../components/ContentGeneration/GeneratedContentDisplay';

const Content = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const {
    isGenerating,
    error,
    lastGenerated,
    generateTweet,
    clearError,
    clearLastGenerated
  } = useContentGeneration();

  const handleGenerateContent = async (requestData) => {
    clearError();
    await generateTweet(requestData);
  };

  const handleEditContent = (newContent) => {
    // Update the generated content with edited version
    // This could be enhanced to save drafts
    console.log('Content edited:', newContent);
  };

  const handleScheduleContent = (content) => {
    // Navigate to scheduling interface or open modal
    console.log('Schedule content:', content);
    // You could navigate to a scheduling page or open a modal here
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generation Form */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Content Generation</h2>
            <ContentGenerationForm
              onGenerate={handleGenerateContent}
              isGenerating={isGenerating}
              error={error}
            />
          </div>

          {/* Generated Content Display */}
          {lastGenerated && (
            <GeneratedContentDisplay
              content={lastGenerated}
              onEdit={handleEditContent}
              onSchedule={handleScheduleContent}
              onClear={clearLastGenerated}
            />
          )}
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

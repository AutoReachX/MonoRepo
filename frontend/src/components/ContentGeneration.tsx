'use client';

import { useState } from 'react';
import { useContentGeneration } from '@/hooks/useContentGeneration';
import { ContentRequest } from '@/lib/contentService';

const ContentGeneration = () => {
  const { generateContent, isGenerating, error } = useContentGeneration();
  const [formData, setFormData] = useState<ContentRequest>({
    topic: '',
    tone: 'professional',
    length: 'medium',
    includeHashtags: true,
    includeEmojis: false,
  });
  const [generatedContent, setGeneratedContent] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic.trim()) return;

    const content = await generateContent(formData);
    if (content) {
      setGeneratedContent(content.content);
    }
  };

  const handleInputChange = (field: keyof ContentRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Generate Content</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Topic Input */}
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
            Topic
          </label>
          <input
            type="text"
            id="topic"
            value={formData.topic}
            onChange={(e) => handleInputChange('topic', e.target.value)}
            placeholder="What would you like to tweet about?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Tone Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(['professional', 'casual', 'humorous', 'inspirational'] as const).map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => handleInputChange('tone', tone)}
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  formData.tone === tone
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {tone.charAt(0).toUpperCase() + tone.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Length Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
          <div className="grid grid-cols-3 gap-2">
            {(['short', 'medium', 'long'] as const).map((length) => (
              <button
                key={length}
                type="button"
                onClick={() => handleInputChange('length', length)}
                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                  formData.length === length
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {length.charAt(0).toUpperCase() + length.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hashtags"
              checked={formData.includeHashtags}
              onChange={(e) => handleInputChange('includeHashtags', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="hashtags" className="ml-2 text-sm text-gray-700">
              Include hashtags
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="emojis"
              checked={formData.includeEmojis}
              onChange={(e) => handleInputChange('includeEmojis', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="emojis" className="ml-2 text-sm text-gray-700">
              Include emojis
            </label>
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={isGenerating || !formData.topic.trim()}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Generate Content'}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Generated Content */}
      {generatedContent && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Generated Content:</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{generatedContent}</p>
          <div className="mt-3 flex space-x-2">
            <button className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700">
              Schedule
            </button>
            <button className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700">
              Save Draft
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentGeneration;

/**
 * Content Generation Form Component
 * Following Single Responsibility Principle - only handles form UI and validation
 */

import React, { useState } from 'react';
import { contentService } from '../../services/contentService';

const STYLE_OPTIONS = [
  { value: 'engaging', label: 'Engaging' },
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'educational', label: 'Educational' },
  { value: 'humorous', label: 'Humorous' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
];

const ContentGenerationForm = ({ onGenerate, isGenerating, error }) => {
  const [formData, setFormData] = useState({
    topic: '',
    style: 'engaging',
    userContext: '',
    language: 'en'
  });
  
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.topic.trim()) {
      errors.topic = 'Topic is required';
    } else if (formData.topic.length < 3) {
      errors.topic = 'Topic must be at least 3 characters';
    } else if (formData.topic.length > 200) {
      errors.topic = 'Topic cannot exceed 200 characters';
    }
    
    if (formData.userContext && formData.userContext.length > 500) {
      errors.userContext = 'User context cannot exceed 500 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await onGenerate({
        topic: formData.topic.trim(),
        style: formData.style,
        user_context: formData.userContext.trim() || null,
        language: formData.language
      });
    } catch (err) {
      // Error is handled by parent component
      console.error('Generation failed:', err);
    }
  };

  const isFormValid = formData.topic.trim().length >= 3;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Topic Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Topic or Theme *
        </label>
        <input
          type="text"
          value={formData.topic}
          onChange={(e) => handleInputChange('topic', e.target.value)}
          className={`input-field ${validationErrors.topic ? 'border-red-500' : ''}`}
          placeholder="e.g., AI in marketing, productivity tips, startup advice"
          disabled={isGenerating}
        />
        {validationErrors.topic && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.topic}</p>
        )}
        <p className="text-gray-500 text-sm mt-1">
          {formData.topic.length}/200 characters
        </p>
      </div>

      {/* Style Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Style
        </label>
        <select
          value={formData.style}
          onChange={(e) => handleInputChange('style', e.target.value)}
          className="input-field"
          disabled={isGenerating}
        >
          {STYLE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* User Context */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          User Context (Optional)
        </label>
        <textarea
          value={formData.userContext}
          onChange={(e) => handleInputChange('userContext', e.target.value)}
          className={`input-field ${validationErrors.userContext ? 'border-red-500' : ''}`}
          placeholder="Additional context about your brand, audience, or specific requirements..."
          rows={3}
          disabled={isGenerating}
        />
        {validationErrors.userContext && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.userContext}</p>
        )}
        <p className="text-gray-500 text-sm mt-1">
          {formData.userContext.length}/500 characters
        </p>
      </div>

      {/* Language Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Language
        </label>
        <select
          value={formData.language}
          onChange={(e) => handleInputChange('language', e.target.value)}
          className="input-field"
          disabled={isGenerating}
        >
          {LANGUAGE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormValid || isGenerating}
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
          isFormValid && !isGenerating
            ? 'btn-primary'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </span>
        ) : (
          'Generate Tweet'
        )}
      </button>
    </form>
  );
};

export default ContentGenerationForm;

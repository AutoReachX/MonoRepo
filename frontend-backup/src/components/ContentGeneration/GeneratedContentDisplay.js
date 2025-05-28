/**
 * Generated Content Display Component
 * Following Single Responsibility Principle - only handles displaying generated content
 */

import React, { useState } from 'react';
import { contentService } from '../../services/contentService';

const GeneratedContentDisplay = ({ content, onEdit, onSchedule, onClear }) => {
  const [editedContent, setEditedContent] = useState(content?.content || '');
  const [isEditing, setIsEditing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!content) {
    return null;
  }

  const validation = contentService.validateTweetContent(editedContent);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (validation.isValid) {
      onEdit(editedContent);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(content.content);
    setIsEditing(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleSchedule = () => {
    if (validation.isValid) {
      onSchedule(editedContent);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Generated Content</h3>
        <button
          onClick={onClear}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          title="Clear content"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content Display/Edit Area */}
      <div className="mb-4">
        {isEditing ? (
          <div>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className={`w-full p-3 border rounded-lg resize-none ${
                validation.isValid ? 'border-gray-300' : 'border-red-500'
              }`}
              rows={4}
              placeholder="Edit your tweet content..."
            />
            
            {/* Character Count and Validation */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-4">
                <span className={`text-sm ${
                  validation.remainingCharacters < 0 ? 'text-red-500' : 
                  validation.remainingCharacters < 20 ? 'text-yellow-500' : 'text-gray-500'
                }`}>
                  {validation.characterCount}/280 characters
                </span>
                {validation.remainingCharacters < 0 && (
                  <span className="text-red-500 text-sm">
                    {Math.abs(validation.remainingCharacters)} over limit
                  </span>
                )}
              </div>
            </div>

            {/* Validation Errors */}
            {!validation.isValid && (
              <div className="mt-2">
                {validation.errors.map((error, index) => (
                  <p key={index} className="text-red-500 text-sm">{error}</p>
                ))}
              </div>
            )}

            {/* Edit Actions */}
            <div className="flex space-x-2 mt-3">
              <button
                onClick={handleSave}
                disabled={!validation.isValid}
                className={`px-4 py-2 rounded-lg font-medium ${
                  validation.isValid
                    ? 'btn-primary'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-gray-900 whitespace-pre-wrap">{editedContent}</p>
            </div>
            
            {/* Content Stats */}
            <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
              <span>{editedContent.length} characters</span>
              {content.tokens_used && (
                <span>{content.tokens_used} tokens used</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!isEditing && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleEdit}
            className="btn-secondary"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>

          <button
            onClick={handleCopy}
            className={`btn-secondary ${copySuccess ? 'bg-green-100 text-green-700' : ''}`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copySuccess ? 'Copied!' : 'Copy'}
          </button>

          <button
            onClick={handleSchedule}
            className="btn-primary"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Schedule
          </button>
        </div>
      )}

      {/* Generation Details (Collapsible) */}
      {content.prompt && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
            View generation details
          </summary>
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Prompt used:</h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{content.prompt}</p>
          </div>
        </details>
      )}
    </div>
  );
};

export default GeneratedContentDisplay;

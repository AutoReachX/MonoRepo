'use client';

import { useState } from 'react';
import { ContentRequest } from '@/lib/contentService';
import {
  CONTENT_TONES,
  CONTENT_LENGTHS,
  VALIDATION_RULES
} from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ContentFormProps {
  onSubmit: (data: ContentRequest) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  initialData?: Partial<ContentRequest>;
}

const ContentForm = ({ onSubmit, isLoading, error, initialData }: ContentFormProps) => {
  const [formData, setFormData] = useState<ContentRequest>({
    topic: initialData?.topic || '',
    tone: initialData?.tone || 'professional',
    length: initialData?.length || 'medium',
    includeHashtags: initialData?.includeHashtags ?? true,
    includeEmojis: initialData?.includeEmojis ?? false,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateTopic = (topic: string): string | null => {
    if (!topic.trim()) {
      return 'Topic is required';
    }
    if (topic.length < VALIDATION_RULES.MIN_TOPIC_LENGTH) {
      return `Topic must be at least ${VALIDATION_RULES.MIN_TOPIC_LENGTH} characters`;
    }
    if (topic.length > VALIDATION_RULES.MAX_TOPIC_LENGTH) {
      return `Topic cannot exceed ${VALIDATION_RULES.MAX_TOPIC_LENGTH} characters`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const topicError = validateTopic(formData.topic);
    if (topicError) {
      setValidationErrors({ topic: topicError });
      return;
    }

    setValidationErrors({});
    await onSubmit(formData);
  };

  const handleInputChange = (field: keyof ContentRequest, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Topic"
        value={formData.topic}
        onChange={(e) => handleInputChange('topic', e.target.value)}
        placeholder="What would you like to tweet about?"
        error={validationErrors.topic}
        required
        maxLength={VALIDATION_RULES.MAX_TOPIC_LENGTH}
      />

      {/* Character count for topic */}
      <div className="text-sm text-gray-500 text-right">
        {formData.topic.length}/{VALIDATION_RULES.MAX_TOPIC_LENGTH} characters
      </div>

      {/* Tone Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {CONTENT_TONES.map((tone) => (
            <Button
              key={tone.value}
              type="button"
              variant={formData.tone === tone.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleInputChange('tone', tone.value)}
            >
              {tone.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Length Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
        <div className="grid grid-cols-3 gap-2">
          {CONTENT_LENGTHS.map((length) => (
            <Button
              key={length.value}
              type="button"
              variant={formData.length === length.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleInputChange('length', length.value)}
            >
              {length.label}
            </Button>
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

      <Button
        type="submit"
        isLoading={isLoading}
        disabled={!formData.topic.trim()}
        className="w-full"
      >
        {isLoading ? 'Generating...' : 'Generate Content'}
      </Button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </form>
  );
};

export default ContentForm;

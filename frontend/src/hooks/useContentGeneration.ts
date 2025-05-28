import { useState } from 'react';
import { contentService, ContentRequest, GeneratedContent } from '@/lib/contentService';

export const useContentGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = async (request: ContentRequest): Promise<GeneratedContent | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const content = await contentService.generateContent(request);
      return content;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate content';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateContent,
    isGenerating,
    error,
  };
};

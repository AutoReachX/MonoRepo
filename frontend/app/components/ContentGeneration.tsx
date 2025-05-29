'use client';

import { useState } from 'react';
import { useContentGeneration } from '@/hooks/useContentGeneration';
import { ContentRequest, GeneratedContent } from '@/lib/contentService';
import ContentForm from '@/components/content/ContentForm';
import ContentDisplay from '@/components/content/ContentDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const ContentGeneration = () => {
  const { generateContent, isLoading, errorState } = useContentGeneration();
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  const handleFormSubmit = async (formData: ContentRequest) => {
    const content = await generateContent(formData);
    if (content) {
      setGeneratedContent(content);
    }
  };

  const handleSchedule = (content: GeneratedContent) => {
    // TODO: Implement scheduling logic
    console.log('Schedule content:', content);
  };

  const handleSaveDraft = (content: GeneratedContent) => {
    // TODO: Implement save draft logic
    console.log('Save draft:', content);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Content</CardTitle>
        </CardHeader>
        <CardContent>
          <ContentForm
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
            error={errorState.error?.message}
          />
        </CardContent>
      </Card>

      {generatedContent && (
        <ContentDisplay
          content={generatedContent}
          onSchedule={handleSchedule}
          onSaveDraft={handleSaveDraft}
        />
      )}
    </div>
  );
};

export default ContentGeneration;

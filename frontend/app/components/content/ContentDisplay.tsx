'use client';

import { GeneratedContent } from '@/lib/contentService';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface ContentDisplayProps {
  content: GeneratedContent;
  onSchedule?: (content: GeneratedContent) => void;
  onSaveDraft?: (content: GeneratedContent) => void;
  onEdit?: (content: GeneratedContent) => void;
  onDelete?: (contentId: string) => void;
}

const ContentDisplay = ({ 
  content, 
  onSchedule, 
  onSaveDraft, 
  onEdit, 
  onDelete 
}: ContentDisplayProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>Generated Content</CardTitle>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(content.status)}`}>
            {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
          </span>
        </div>
        <p className="text-sm text-gray-500">
          Created {formatDate(content.createdAt)}
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-gray-900 whitespace-pre-wrap">{content.content}</p>
          </div>

          {content.hashtags && content.hashtags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Hashtags:</h4>
              <div className="flex flex-wrap gap-2">
                {content.hashtags.map((hashtag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    #{hashtag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {onSchedule && content.status === 'draft' && (
              <Button
                size="sm"
                onClick={() => onSchedule(content)}
              >
                Schedule
              </Button>
            )}
            
            {onSaveDraft && content.status !== 'draft' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSaveDraft(content)}
              >
                Save Draft
              </Button>
            )}
            
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(content)}
              >
                Edit
              </Button>
            )}
            
            {onDelete && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(content.id)}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentDisplay;

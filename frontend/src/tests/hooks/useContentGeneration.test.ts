/**
 * Unit tests for content generation hooks.
 * Tests content generation logic, state management, and error handling.
 */

import { renderHook, act } from '@testing-library/react';
import { useContentGeneration, useContentHistory } from '@/hooks/useContentGeneration';
import { ContentService } from '@/lib/contentService';

// Mock the content service
jest.mock('@/lib/contentService', () => ({
  ContentService: {
    generateTweet: jest.fn(),
    generateThread: jest.fn(),
    generateReply: jest.fn(),
    getContentHistory: jest.fn()
  }
}));

describe('useContentGeneration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useContentGeneration());

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.generatedContent).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.generationHistory).toEqual([]);
  });

  it('should generate tweet successfully', async () => {
    const mockContent = {
      content: 'Generated tweet content',
      metadata: { type: 'tweet', style: 'engaging' }
    };
    (ContentService.generateTweet as jest.Mock).mockResolvedValue(mockContent);

    const { result } = renderHook(() => useContentGeneration());

    await act(async () => {
      await result.current.generateTweet({
        topic: 'AI trends',
        style: 'engaging',
        language: 'en'
      });
    });

    expect(ContentService.generateTweet).toHaveBeenCalledWith({
      topic: 'AI trends',
      style: 'engaging',
      language: 'en'
    });
    expect(result.current.generatedContent).toEqual(mockContent);
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.generationHistory).toHaveLength(1);
  });

  it('should handle tweet generation error', async () => {
    const mockError = new Error('Generation failed');
    (ContentService.generateTweet as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useContentGeneration());

    await act(async () => {
      await result.current.generateTweet({
        topic: 'AI trends',
        style: 'engaging',
        language: 'en'
      });
    });

    expect(result.current.generatedContent).toBeNull();
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.error).toBe('Generation failed');
  });

  it('should generate thread successfully', async () => {
    const mockContent = {
      content: 'Generated thread content',
      metadata: { type: 'thread', numTweets: 5 }
    };
    (ContentService.generateThread as jest.Mock).mockResolvedValue(mockContent);

    const { result } = renderHook(() => useContentGeneration());

    await act(async () => {
      await result.current.generateThread({
        topic: 'AI trends',
        numTweets: 5,
        style: 'informative',
        language: 'en'
      });
    });

    expect(ContentService.generateThread).toHaveBeenCalledWith({
      topic: 'AI trends',
      numTweets: 5,
      style: 'informative',
      language: 'en'
    });
    expect(result.current.generatedContent).toEqual(mockContent);
    expect(result.current.generationHistory).toHaveLength(1);
  });

  it('should generate reply successfully', async () => {
    const mockContent = {
      content: 'Generated reply content',
      metadata: { type: 'reply', replyStyle: 'helpful' }
    };
    (ContentService.generateReply as jest.Mock).mockResolvedValue(mockContent);

    const { result } = renderHook(() => useContentGeneration());

    await act(async () => {
      await result.current.generateReply({
        originalTweet: 'Original tweet content',
        replyStyle: 'helpful',
        language: 'en'
      });
    });

    expect(ContentService.generateReply).toHaveBeenCalledWith({
      originalTweet: 'Original tweet content',
      replyStyle: 'helpful',
      language: 'en'
    });
    expect(result.current.generatedContent).toEqual(mockContent);
    expect(result.current.generationHistory).toHaveLength(1);
  });

  it('should set loading state during generation', async () => {
    let resolvePromise: (value: any) => void;
    const mockPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    (ContentService.generateTweet as jest.Mock).mockReturnValue(mockPromise);

    const { result } = renderHook(() => useContentGeneration());

    // Start generation
    act(() => {
      result.current.generateTweet({
        topic: 'AI trends',
        style: 'engaging',
        language: 'en'
      });
    });

    expect(result.current.isGenerating).toBe(true);

    // Complete generation
    await act(async () => {
      resolvePromise!({ content: 'Generated content' });
      await mockPromise;
    });

    expect(result.current.isGenerating).toBe(false);
  });

  it('should clear generated content', () => {
    const { result } = renderHook(() => useContentGeneration());

    // Set some content first
    act(() => {
      result.current.setGeneratedContent({
        content: 'Test content',
        metadata: { type: 'tweet' }
      });
    });

    act(() => {
      result.current.clearContent();
    });

    expect(result.current.generatedContent).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should clear error', () => {
    const { result } = renderHook(() => useContentGeneration());

    // Set error first
    act(() => {
      result.current.setError('Test error');
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should regenerate last content', async () => {
    const mockContent = {
      content: 'Regenerated content',
      metadata: { type: 'tweet' }
    };
    (ContentService.generateTweet as jest.Mock).mockResolvedValue(mockContent);

    const { result } = renderHook(() => useContentGeneration());

    // Generate initial content
    await act(async () => {
      await result.current.generateTweet({
        topic: 'AI trends',
        style: 'engaging',
        language: 'en'
      });
    });

    // Clear mocks to verify regeneration call
    jest.clearAllMocks();
    (ContentService.generateTweet as jest.Mock).mockResolvedValue(mockContent);

    // Regenerate
    await act(async () => {
      await result.current.regenerateContent();
    });

    expect(ContentService.generateTweet).toHaveBeenCalledWith({
      topic: 'AI trends',
      style: 'engaging',
      language: 'en'
    });
    expect(result.current.generatedContent).toEqual(mockContent);
  });

  it('should not regenerate if no last request', async () => {
    const { result } = renderHook(() => useContentGeneration());

    await act(async () => {
      await result.current.regenerateContent();
    });

    expect(ContentService.generateTweet).not.toHaveBeenCalled();
    expect(ContentService.generateThread).not.toHaveBeenCalled();
    expect(ContentService.generateReply).not.toHaveBeenCalled();
  });
});

describe('useContentHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useContentHistory());

    expect(result.current.history).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.pagination.page).toBe(1);
    expect(result.current.pagination.hasMore).toBe(true);
  });

  it('should load content history successfully', async () => {
    const mockHistory = {
      items: [
        { id: '1', content: 'Content 1', createdAt: '2023-01-01' },
        { id: '2', content: 'Content 2', createdAt: '2023-01-02' }
      ],
      pagination: { page: 1, totalPages: 2, hasMore: true }
    };
    (ContentService.getContentHistory as jest.Mock).mockResolvedValue(mockHistory);

    const { result } = renderHook(() => useContentHistory());

    await act(async () => {
      await result.current.loadHistory();
    });

    expect(ContentService.getContentHistory).toHaveBeenCalledWith({
      page: 1,
      limit: 20
    });
    expect(result.current.history).toEqual(mockHistory.items);
    expect(result.current.pagination).toEqual(mockHistory.pagination);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle history loading error', async () => {
    const mockError = new Error('Failed to load history');
    (ContentService.getContentHistory as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useContentHistory());

    await act(async () => {
      await result.current.loadHistory();
    });

    expect(result.current.history).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Failed to load history');
  });

  it('should load more content', async () => {
    const mockHistory1 = {
      items: [{ id: '1', content: 'Content 1' }],
      pagination: { page: 1, totalPages: 2, hasMore: true }
    };
    const mockHistory2 = {
      items: [{ id: '2', content: 'Content 2' }],
      pagination: { page: 2, totalPages: 2, hasMore: false }
    };

    (ContentService.getContentHistory as jest.Mock)
      .mockResolvedValueOnce(mockHistory1)
      .mockResolvedValueOnce(mockHistory2);

    const { result } = renderHook(() => useContentHistory());

    // Load initial history
    await act(async () => {
      await result.current.loadHistory();
    });

    // Load more
    await act(async () => {
      await result.current.loadMore();
    });

    expect(ContentService.getContentHistory).toHaveBeenCalledTimes(2);
    expect(ContentService.getContentHistory).toHaveBeenLastCalledWith({
      page: 2,
      limit: 20
    });
    expect(result.current.history).toHaveLength(2);
    expect(result.current.pagination.hasMore).toBe(false);
  });

  it('should refresh history', async () => {
    const mockHistory = {
      items: [{ id: '1', content: 'Refreshed content' }],
      pagination: { page: 1, totalPages: 1, hasMore: false }
    };
    (ContentService.getContentHistory as jest.Mock).mockResolvedValue(mockHistory);

    const { result } = renderHook(() => useContentHistory());

    await act(async () => {
      await result.current.refreshHistory();
    });

    expect(result.current.pagination.page).toBe(1);
    expect(result.current.history).toEqual(mockHistory.items);
  });

  it('should filter history by type', async () => {
    const mockHistory = {
      items: [{ id: '1', content: 'Tweet content', type: 'tweet' }],
      pagination: { page: 1, totalPages: 1, hasMore: false }
    };
    (ContentService.getContentHistory as jest.Mock).mockResolvedValue(mockHistory);

    const { result } = renderHook(() => useContentHistory());

    await act(async () => {
      await result.current.filterByType('tweet');
    });

    expect(ContentService.getContentHistory).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      type: 'tweet'
    });
    expect(result.current.filters.type).toBe('tweet');
  });

  it('should clear filters', async () => {
    const { result } = renderHook(() => useContentHistory());

    // Set filter first
    await act(async () => {
      await result.current.filterByType('tweet');
    });

    await act(async () => {
      await result.current.clearFilters();
    });

    expect(result.current.filters.type).toBeUndefined();
  });
});

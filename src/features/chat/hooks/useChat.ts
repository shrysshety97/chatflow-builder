// Custom hook for chat operations
import { useState, useCallback } from 'react';
import { aiService, StreamChatParams } from '../services/ai.service';

interface UseChatOptions {
  systemPrompt?: string;
  onError?: (error: Error) => void;
}

export function useChat(options: UseChatOptions = {}) {
  const [isStreaming, setIsStreaming] = useState(false);

  const streamChat = useCallback(async ({
    messages,
    onDelta,
    onDone,
  }: Omit<StreamChatParams, 'systemPrompt'>) => {
    setIsStreaming(true);

    try {
      await aiService.streamChat({
        messages,
        systemPrompt: options.systemPrompt,
        onDelta,
        onDone,
      });
    } catch (error) {
      console.error('Stream chat error:', error);
      options.onError?.(error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    } finally {
      setIsStreaming(false);
    }
  }, [options]);

  return { streamChat, isStreaming };
}

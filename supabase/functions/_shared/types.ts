// Shared types for edge functions

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  systemPrompt?: string;
  model?: string;
}

export interface ChatResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: string;
}

export interface StreamDelta {
  content?: string;
  finishReason?: string;
}

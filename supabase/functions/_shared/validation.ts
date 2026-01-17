// Request validation utilities

import { ChatMessage, ChatRequest } from './types.ts';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateChatRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Request body is required' };
  }

  const request = body as Partial<ChatRequest>;

  if (!request.messages || !Array.isArray(request.messages)) {
    return { isValid: false, error: 'Messages array is required' };
  }

  if (request.messages.length === 0) {
    return { isValid: false, error: 'At least one message is required' };
  }

  for (let i = 0; i < request.messages.length; i++) {
    const msg = request.messages[i];
    if (!msg.role || !['user', 'assistant', 'system'].includes(msg.role)) {
      return { isValid: false, error: `Invalid role at message ${i}` };
    }
    if (typeof msg.content !== 'string') {
      return { isValid: false, error: `Invalid content at message ${i}` };
    }
  }

  if (request.systemPrompt !== undefined && typeof request.systemPrompt !== 'string') {
    return { isValid: false, error: 'System prompt must be a string' };
  }

  return { isValid: true };
}

export function sanitizeMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content.trim().slice(0, 32000), // Limit content length
  }));
}

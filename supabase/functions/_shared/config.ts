// Configuration constants for edge functions

export const AI_CONFIG = {
  GATEWAY_URL: 'https://ai.gateway.lovable.dev/v1/chat/completions',
  DEFAULT_MODEL: 'google/gemini-3-flash-preview',
  DEFAULT_SYSTEM_PROMPT: 'You are a helpful AI assistant. Be concise, accurate, and friendly in your responses.',
  MAX_TOKENS: 4096,
  TEMPERATURE: 0.7,
};

export const ERROR_MESSAGES = {
  RATE_LIMIT: 'Rate limit exceeded. Please try again later.',
  PAYMENT_REQUIRED: 'Payment required. Please add credits to continue.',
  API_KEY_MISSING: 'API key is not configured',
  SERVICE_UNAVAILABLE: 'AI service temporarily unavailable',
  UNKNOWN_ERROR: 'An unexpected error occurred',
};

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

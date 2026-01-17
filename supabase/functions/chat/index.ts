// Chat edge function - handles AI chat completions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors, streamResponse, errorResponse } from "../_shared/cors.ts";
import { validateChatRequest, sanitizeMessages } from "../_shared/validation.ts";
import { AI_CONFIG, ERROR_MESSAGES, HTTP_STATUS } from "../_shared/config.ts";
import { createLogger } from "../_shared/logger.ts";
import type { ChatRequest } from "../_shared/types.ts";

const log = createLogger('chat');

// Controller: handles incoming request routing
async function handleRequest(req: Request): Promise<Response> {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', HTTP_STATUS.BAD_REQUEST);
  }

  try {
    const body = await req.json();
    return await processChat(body);
  } catch (error) {
    log.error('Request parsing failed', { error: error instanceof Error ? error.message : error });
    return errorResponse('Invalid JSON body', HTTP_STATUS.BAD_REQUEST);
  }
}

// Service: processes chat completions
async function processChat(body: unknown): Promise<Response> {
  // Validate request
  const validation = validateChatRequest(body);
  if (!validation.isValid) {
    log.warn('Validation failed', { error: validation.error });
    return errorResponse(validation.error || 'Invalid request', HTTP_STATUS.BAD_REQUEST);
  }

  const request = body as ChatRequest;
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  
  if (!apiKey) {
    log.error('API key not configured');
    return errorResponse(ERROR_MESSAGES.API_KEY_MISSING, HTTP_STATUS.INTERNAL_ERROR);
  }

  // Prepare messages
  const messages = [
    { 
      role: 'system' as const, 
      content: request.systemPrompt || AI_CONFIG.DEFAULT_SYSTEM_PROMPT 
    },
    ...sanitizeMessages(request.messages),
  ];

  log.info('Processing chat request', { 
    messageCount: messages.length, 
    model: request.model || AI_CONFIG.DEFAULT_MODEL 
  });

  // Call AI gateway
  try {
    const response = await callAIGateway(apiKey, messages, request.model);
    return response;
  } catch (error) {
    log.error('AI gateway call failed', { error: error instanceof Error ? error.message : error });
    return errorResponse(ERROR_MESSAGES.SERVICE_UNAVAILABLE, HTTP_STATUS.INTERNAL_ERROR);
  }
}

// Gateway: calls external AI service
async function callAIGateway(
  apiKey: string, 
  messages: Array<{ role: string; content: string }>,
  model?: string
): Promise<Response> {
  const response = await fetch(AI_CONFIG.GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model || AI_CONFIG.DEFAULT_MODEL,
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    return handleGatewayError(response);
  }

  log.info('AI gateway response received', { status: response.status });
  return streamResponse(response.body);
}

// Error handler for gateway responses
async function handleGatewayError(response: Response): Promise<Response> {
  const status = response.status;
  
  if (status === HTTP_STATUS.RATE_LIMITED) {
    log.warn('Rate limit exceeded');
    return errorResponse(ERROR_MESSAGES.RATE_LIMIT, HTTP_STATUS.RATE_LIMITED);
  }
  
  if (status === HTTP_STATUS.PAYMENT_REQUIRED) {
    log.warn('Payment required');
    return errorResponse(ERROR_MESSAGES.PAYMENT_REQUIRED, HTTP_STATUS.PAYMENT_REQUIRED);
  }

  const errorText = await response.text();
  log.error('AI gateway error', { status, error: errorText });
  return errorResponse(ERROR_MESSAGES.SERVICE_UNAVAILABLE, HTTP_STATUS.INTERNAL_ERROR);
}

// Main entry point
serve(handleRequest);

// CORS headers configuration for edge functions

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

export function jsonResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function streamResponse(body: ReadableStream<Uint8Array> | null): Response {
  return new Response(body, {
    headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
  });
}

export function errorResponse(message: string, status = 500, code?: string): Response {
  return jsonResponse({ error: message, code }, status);
}

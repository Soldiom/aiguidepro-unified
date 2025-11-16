import type { Handler } from '@netlify/functions';

// Simple health check endpoint
export const handler: Handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'AI Guide Pro Unified System',
      version: '1.0.0',
    }),
  };
};

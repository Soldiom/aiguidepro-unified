import type { Handler } from '@netlify/functions';
import { createContext } from '../../server/_core/context';
import { appRouter } from '../../server/routers';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

// Main tRPC handler for Netlify Functions
export const handler: Handler = async (event, context) => {
  const request = new Request(event.rawUrl, {
    method: event.httpMethod,
    headers: new Headers(event.headers as Record<string, string>),
    body: event.body,
  });

  try {
    const response = await fetchRequestHandler({
      endpoint: '/api/trpc',
      req: request,
      router: appRouter,
      createContext,
    });

    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.text(),
    };
  } catch (error) {
    console.error('tRPC handler error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

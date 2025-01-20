import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { Hono } from 'hono';
import { createContext } from '../trpc/context.js';
import { appRouter } from '../trpc/router/index.js';
import type { Bindings, Variables } from '../types';

// 型付きのHonoインスタンスを作成
export const trpcMiddleware = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>().use('/*', async (c) => {
  try {
    const response = await fetchRequestHandler({
      endpoint: '/trpc',
      req: c.req.raw,
      router: appRouter,
      createContext: async () => {
        return createContext({ hono: c });
      },
      onError({ error, path }) {
        console.error(`Error in tRPC handler ${path}:`, error);
      },
    });

    return response;
  } catch (error) {
    console.error('tRPC middleware error:', error);
    return c.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

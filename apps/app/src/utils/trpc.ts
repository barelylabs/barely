// src/utils/trpc.ts
import { createTRPCNext } from '@trpc/next';
import { httpBatchLink, loggerLink } from '@trpc/client';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@barely/api';
import { transformer } from '@barely/api/transformer';

import env from '~/env';

export const trpc = createTRPCNext<AppRouter>({
	config() {
		return {
			transformer,
			links: [
				loggerLink({
					enabled: opts =>
						process.env.NODE_ENV === 'development' ||
						(opts.direction === 'down' && opts.result instanceof Error),
				}),
				httpBatchLink({
					url: `${env.NEXT_PUBLIC_APP_BASE_URL}/api/trpc`,
				}),
			],
		};
	},
	ssr: false,
});

/**
 * Inference helpers for input types
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;

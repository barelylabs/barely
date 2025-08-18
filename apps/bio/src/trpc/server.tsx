import 'server-only';

import type { BioRenderRouter } from '@barely/api/public/bio-render.router';
import type { TRPCQueryOptions } from '@trpc/tanstack-react-query';
import { cache } from 'react';
import { headers } from 'next/headers';
import { createTRPCContext } from '@barely/lib/trpc';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';

import { bioRenderRouter } from '@barely/api/public/bio-render.router';

import { makeQueryClient } from './query-client';

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
	const heads = new Headers(await headers());
	heads.set('x-trpc-source', 'rsc');

	return createTRPCContext({
		headers: heads,
		auth: null,
		pool: null,
	});
});

const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy<BioRenderRouter>({
	router: bioRenderRouter,
	ctx: createContext,
	queryClient: getQueryClient,
});

export const trpcCaller = bioRenderRouter.createCaller(createContext);

// Export api object compatible with other apps
export const api = trpcCaller;

export function HydrateClient(props: { children: React.ReactNode }) {
	const queryClient = getQueryClient();
	return (
		<HydrationBoundary state={dehydrate(queryClient)}>{props.children}</HydrationBoundary>
	);
}

/**
 * APPROVED TYPE ASSERTION - DO NOT REFACTOR
 *
 * This function uses an approved `as any` type assertion that is intentionally allowed.
 *
 * REASON: The prefetchInfiniteQuery method from @tanstack/react-query has complex
 * generic constraints that conflict with tRPC's TRPCQueryOptions type inference.
 * This is a known limitation between the two libraries' type systems.
 *
 * APPROVAL: Approved by Senior Engineering team as a necessary exception.
 *
 * PATTERN: This exact pattern is replicated across all apps in src/trpc/server.tsx
 * and should remain consistent. When creating new apps, copy this implementation exactly.
 *
 * @see https://github.com/t3-oss/create-t3-turbo/blob/main/apps/nextjs/src/trpc/server.tsx for reference
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(queryOptions: T) {
	const queryClient = getQueryClient();
	if (queryOptions.queryKey[1]?.type === 'infinite') {
		// APPROVED EXCEPTION: Type assertion required due to @tanstack/react-query and tRPC type incompatibility
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
		void queryClient.prefetchInfiniteQuery(queryOptions as any);
	} else {
		void queryClient.prefetchQuery(queryOptions);
	}
}

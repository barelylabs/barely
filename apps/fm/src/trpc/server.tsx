import 'server-only'; // <-- ensure this file cannot be imported from the client

import type { FmPageRouter } from '@barely/api/public/fm-page.router';
import type { TRPCQueryOptions } from '@trpc/tanstack-react-query';
import { cache } from 'react';
import { headers } from 'next/headers';
import { createTRPCContext } from '@barely/lib/trpc';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';

import { fmPageRouter } from '@barely/api/public/fm-page.router';

import { makeQueryClient } from '~/trpc/query-client';

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

export const trpc = createTRPCOptionsProxy<FmPageRouter>({
	router: fmPageRouter,
	ctx: createContext,
	queryClient: getQueryClient,
});

export const trpcCaller = fmPageRouter.createCaller(createContext);

export function HydrateClient(props: { children: React.ReactNode }) {
	const queryClient = getQueryClient();
	return (
		<HydrationBoundary state={dehydrate(queryClient)}>{props.children}</HydrationBoundary>
	);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(queryOptions: T) {
	const queryClient = getQueryClient();
	if (queryOptions.queryKey[1]?.type === 'infinite') {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
		void queryClient.prefetchInfiniteQuery(queryOptions as any);
	} else {
		void queryClient.prefetchQuery(queryOptions);
	}
}

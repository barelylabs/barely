import 'server-only'; // <-- ensure this file cannot be imported from the client

import type { AppRouter } from '@barely/server/api/router';
import type { TRPCQueryOptions } from '@trpc/tanstack-react-query';
import { cache } from 'react';
import { headers } from 'next/headers';
import { appRouter } from '@barely/server/api/router';
import { createTRPCContext } from '@barely/server/api/trpc';
import { auth } from '@barely/server/auth';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';

import { makeQueryClient } from '~/trpc/query-client';

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
	const heads = new Headers(await headers());
	heads.set('x-trpc-source', 'rsc');

	const session = await auth();

	return createTRPCContext({
		headers: heads,
		session,
	});
});

const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy<AppRouter>({
	router: appRouter,
	ctx: createContext,
	queryClient: getQueryClient,
});

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

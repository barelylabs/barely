'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { useWorkspace } from './use-workspace';

export function useCartFunnels() {
	const trpc = useTRPC();
	const { handle } = useWorkspace();

	const {
		data: infiniteCartFunnels,
		isLoading: isLoadingCartFunnels,
		fetchNextPage,
		hasNextPage,
	} = useSuspenseInfiniteQuery(
		trpc.cartFunnel.byWorkspace.infiniteQueryOptions(
			{
				handle,
			},
			{
				getNextPageParam: lastPage => lastPage.nextCursor,
			},
		),
	);

	const cartFunnels = infiniteCartFunnels.pages.flatMap(p => p.cartFunnels);
	const cartFunnelOptions = cartFunnels.map(p => ({
		value: p.id,
		label: p.name,
	}));

	return {
		infiniteCartFunnels,
		cartFunnels,
		cartFunnelOptions,
		isLoadingCartFunnels,
		fetchNextPage,
		hasNextPage,
	};
}

'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { useWorkspace } from './use-workspace';

export function useProducts() {
	const trpc = useTRPC();
	const { handle } = useWorkspace();

	const {
		data: infiniteProducts,
		isLoading: isLoadingProducts,
		fetchNextPage,
		hasNextPage,
	} = useSuspenseInfiniteQuery({
		...trpc.product.byWorkspace.infiniteQueryOptions(
			{
				handle,
			},
			{
				getNextPageParam: lastPage => lastPage.nextCursor,
			},
		),
	});

	const products = infiniteProducts.pages.flatMap(p => p.products);
	const productOptions = products.map(p => {
		// const MerchIcon = Ico
		return {
			value: p.id,
			label: p.name,
			merchType: p.merchType,
		};
	});

	return {
		infiniteProducts,
		products,
		productOptions,
		isLoadingProducts,
		fetchNextPage,
		hasNextPage,
	};
}

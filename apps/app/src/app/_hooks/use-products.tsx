import { api } from '@barely/server/api/react';

import { useWorkspace } from '@barely/hooks/use-workspace';

import { Icon } from '@barely/ui/elements/icon';

export function useProducts() {
	const { handle } = useWorkspace();

	const {
		data: infiniteProducts,
		isLoading: isLoadingProducts,
		fetchNextPage,
		hasNextPage,
	} = api.product.byWorkspace.useInfiniteQuery(
		{
			handle,
		},
		{
			getNextPageParam: lastPage => lastPage.nextCursor,
		},
	);

	const products = infiniteProducts?.pages.flatMap(p => p.products);
	const productOptions = products?.map(p => {
		const MerchIcon = Icon[p.merchType];
		const MerchLabel = (
			<div className='flex items-center gap-2'>
				<MerchIcon className='h-4 w-4' />
				<span>{p.name}</span>
			</div>
		);

		return {
			value: p.id,
			label: MerchLabel,
			// merchType: p.merchType,
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

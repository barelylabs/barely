import { api } from '../server/api/react';
import { useWorkspace } from './use-workspace';

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

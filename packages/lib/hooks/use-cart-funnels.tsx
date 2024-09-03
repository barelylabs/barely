import { api } from "../server/api/react";
import { useWorkspace } from "./use-workspace";

export function useCartFunnels() {

    const { handle } = useWorkspace();

    	const { data: infiniteCartFunnels, isLoading: isLoadingCartFunnels, fetchNextPage, hasNextPage  } = api.cartFunnel.byWorkspace.useInfiniteQuery(
				{
					handle,
				},
				{
					getNextPageParam: lastPage => lastPage.nextCursor,
				},
			);

        const cartFunnels = infiniteCartFunnels?.pages.flatMap(p => p.cartFunnels);
        const cartFunnelOptions = cartFunnels?.map(p => ({
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

        }
}
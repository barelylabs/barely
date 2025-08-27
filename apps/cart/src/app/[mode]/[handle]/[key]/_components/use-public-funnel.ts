import { useSuspenseQuery } from '@tanstack/react-query';

import { useCartTRPC } from '@barely/api/public/cart.trpc.react';

export function usePublicFunnel({ handle, key }: { handle: string; key: string }) {
	const trpc = useCartTRPC();
	const { data: publicFunnel } = useSuspenseQuery(
		trpc.publicFunnelByHandleAndKey.queryOptions({ handle, key }),
	);
	return {
		publicFunnel,
	};
}

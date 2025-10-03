import type { updateCheckoutCartFromCheckoutSchema } from '@barely/validators';
import type { z } from 'zod/v4';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { useCartTRPC } from '@barely/api/public/cart.trpc.react';

export function useCart({
	id,
	handle,
	cartKey,
}: {
	id: string;
	handle: string;
	cartKey: string;
}) {
	const trpc = useCartTRPC();
	const queryClient = useQueryClient();

	const {
		data: { cart },
	} = useSuspenseQuery(
		trpc.byIdAndParams.queryOptions(
			{
				id,
				handle,
				key: cartKey,
			},
			{
				staleTime: 5 * 60 * 1000, // 5 minutes
			},
		),
	);

	const { mutate: logEvent } = useMutation(trpc.log.mutationOptions());

	const { mutate: syncCart } = useMutation(
		trpc.updateCheckoutFromCheckout.mutationOptions({
			onMutate: async updateData => {
				await queryClient.cancelQueries({
					queryKey: trpc.byIdAndParams.queryKey({ id, handle, key: cartKey }),
				});
				const previousCart = queryClient.getQueryData(
					trpc.byIdAndParams.queryKey({ id, handle, key: cartKey }),
				);

				queryClient.setQueryData(
					trpc.byIdAndParams.queryKey({ id, handle, key: cartKey }),
					old => {
						if (!old) return;
						return {
							...old,
							cart: {
								...old.cart,
								...updateData,
							},
						};
					},
				);

				return { previousCart };
			},
			onSettled: async () => {
				await queryClient.invalidateQueries({
					queryKey: trpc.byIdAndParams.queryKey({ id, handle, key: cartKey }),
				});
			},
		}),
	);

	const updateCart = (
		updateData: Partial<z.infer<typeof updateCheckoutCartFromCheckoutSchema>>,
	) => {
		syncCart({
			id,
			handle,
			key: cartKey,
			...updateData,
		});
	};

	return {
		cart,
		logEvent,
		updateCart,
	};
}

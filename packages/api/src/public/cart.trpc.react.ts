import { createTRPCContext } from '@trpc/tanstack-react-query';

import type { CartRouter } from './cart.router';

export const {
	TRPCProvider: CartTRPCProvider,
	useTRPC: useCartTRPC,
	useTRPCClient: useCartTRPCClient,
} = createTRPCContext<CartRouter>();

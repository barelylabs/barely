import { createTRPCContext } from '@trpc/tanstack-react-query';

import type { AppRouter } from './app.router';

export const {
	TRPCProvider: TRPCProvider,
	useTRPC: useTRPC,
	useTRPCClient: useTRPCClient,
} = createTRPCContext<AppRouter>();

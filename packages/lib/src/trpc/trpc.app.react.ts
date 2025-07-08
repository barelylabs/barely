import { createTRPCContext } from '@trpc/tanstack-react-query';

import type { AppRouter } from './routes/app.route';

export const {
	TRPCProvider: TRPCProvider,
	useTRPC: useTRPC,
	useTRPCClient: useTRPCClient,
} = createTRPCContext<AppRouter>();

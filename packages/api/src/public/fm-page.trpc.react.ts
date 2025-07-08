import { createTRPCContext } from '@trpc/tanstack-react-query';

import type { FmPageRouter } from './fm-page.router';

export const {
	TRPCProvider: FmPageTRPCProvider,
	useTRPC: useFmPageTRPC,
	useTRPCClient: useFmPageTRPCClient,
} = createTRPCContext<FmPageRouter>();

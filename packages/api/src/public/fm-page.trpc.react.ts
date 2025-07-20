import { createTRPCContext } from '@trpc/tanstack-react-query';

import type { FmRenderRouter } from './fm-render.router';

export const {
	TRPCProvider: FmPageTRPCProvider,
	useTRPC: useFmPageTRPC,
	useTRPCClient: useFmPageTRPCClient,
} = createTRPCContext<FmRenderRouter>();

import { createTRPCContext } from '@trpc/tanstack-react-query';

import type { BioRenderRouter } from './bio-render.router';

export const {
	TRPCProvider: BioRenderTRPCProvider,
	useTRPC: useBioRenderTRPC,
	useTRPCClient: useBioRenderTRPCClient,
} = createTRPCContext<BioRenderRouter>();

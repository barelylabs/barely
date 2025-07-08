import { createTRPCContext } from '@trpc/tanstack-react-query';

import type { LandingPageRenderRouter } from './landing-page-render.router';

export const {
	TRPCProvider: LandingPageRenderTRPCProvider,
	useTRPC: useLandingPageRenderTRPC,
	useTRPCClient: useLandingPageRenderTRPCClient,
} = createTRPCContext<LandingPageRenderRouter>();

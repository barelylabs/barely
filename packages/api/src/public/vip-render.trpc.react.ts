import { createTRPCContext } from '@trpc/tanstack-react-query';

import type { VipRenderRouter } from './vip-render.router';

export const {
	TRPCProvider: VipRenderTRPCProvider,
	useTRPC: useVipRenderTRPC,
	useTRPCClient: useVipRenderTRPCClient,
} = createTRPCContext<VipRenderRouter>();

import type {
	inferRouterContext,
	inferRouterInputs,
	inferRouterOutputs,
} from '@trpc/server';
import { createTRPCRouter } from '@barely/lib/trpc';
import { vipSwapRenderRoute } from '@barely/lib/trpc/routes/vip-swap-render.route';

const vipRenderRouter = createTRPCRouter({
	swap: vipSwapRenderRoute,
});

type VipRenderRouter = typeof vipRenderRouter;
type VipRenderRouterInputs = inferRouterInputs<VipRenderRouter>;
type VipRenderRouterOutputs = inferRouterOutputs<VipRenderRouter>;
type VipRenderRouterContext = inferRouterContext<VipRenderRouter>;
type VipRenderRouterKeys = keyof VipRenderRouter;

export {
	vipRenderRouter,
	type VipRenderRouter,
	type VipRenderRouterInputs,
	type VipRenderRouterOutputs,
	type VipRenderRouterContext,
	type VipRenderRouterKeys,
};

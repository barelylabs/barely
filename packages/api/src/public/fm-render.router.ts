import type {
	inferRouterContext,
	inferRouterInputs,
	inferRouterOutputs,
} from '@trpc/server';
import { createTRPCRouter } from '@barely/lib/trpc';
import { fmRenderRoute } from '@barely/lib/trpc/fm-render.route';

const fmRenderRouter = createTRPCRouter(fmRenderRoute);

type FmRenderRouter = typeof fmRenderRouter;
type FmRenderRouterInputs = inferRouterInputs<FmRenderRouter>;
type FmRenderRouterOutputs = inferRouterOutputs<FmRenderRouter>;
type FmRenderRouterContext = inferRouterContext<FmRenderRouter>;
type FmRenderRouterKeys = keyof FmRenderRouter;

export {
	fmRenderRouter,
	type FmRenderRouter,
	type FmRenderRouterInputs,
	type FmRenderRouterOutputs,
	type FmRenderRouterContext,
	type FmRenderRouterKeys,
};

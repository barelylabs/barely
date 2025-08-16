import type {
	inferRouterContext,
	inferRouterInputs,
	inferRouterOutputs,
} from '@trpc/server';
import { createTRPCRouter } from '@barely/lib/trpc';
import { bioRenderRoute } from '@barely/lib/trpc/routes/bio-render.route';

const bioRenderRouter = createTRPCRouter({
	bio: bioRenderRoute,
});

type BioRenderRouter = typeof bioRenderRouter;
type BioRenderRouterInputs = inferRouterInputs<BioRenderRouter>;
type BioRenderRouterOutputs = inferRouterOutputs<BioRenderRouter>;
type BioRenderRouterContext = inferRouterContext<BioRenderRouter>;
type BioRenderRouterKeys = keyof BioRenderRouter;

export {
	bioRenderRouter,
	type BioRenderRouter,
	type BioRenderRouterInputs,
	type BioRenderRouterOutputs,
	type BioRenderRouterContext,
	type BioRenderRouterKeys,
};

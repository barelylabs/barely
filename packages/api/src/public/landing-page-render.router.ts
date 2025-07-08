import type {
	inferRouterContext,
	inferRouterInputs,
	inferRouterOutputs,
} from '@trpc/server';
import { createTRPCRouter } from '@barely/lib/trpc';
import { landingPageRenderRoute } from '@barely/lib/trpc/landing-page-render.route';

const landingPageRenderRouter = createTRPCRouter(landingPageRenderRoute);

type LandingPageRenderRouter = typeof landingPageRenderRouter;
type LandingPageRenderRouterInputs = inferRouterInputs<LandingPageRenderRouter>;
type LandingPageRenderRouterOutputs = inferRouterOutputs<LandingPageRenderRouter>;
type LandingPageRenderRouterContext = inferRouterContext<LandingPageRenderRouter>;
type LandingPageRenderRouterKeys = keyof LandingPageRenderRouter;

export {
	landingPageRenderRouter,
	type LandingPageRenderRouter,
	type LandingPageRenderRouterInputs,
	type LandingPageRenderRouterOutputs,
	type LandingPageRenderRouterContext,
	type LandingPageRenderRouterKeys,
};

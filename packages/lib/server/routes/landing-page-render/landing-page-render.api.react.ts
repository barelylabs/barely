import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { createTRPCReact } from '@trpc/react-query';

import type { landingPageRenderRouter } from './landing-page-render.router';

export type LandingPageRenderRouter = typeof landingPageRenderRouter;

export const landingPageApi = createTRPCReact<LandingPageRenderRouter>();

export type LandingPageRenderRouterInput = inferRouterInputs<LandingPageRenderRouter>;
export type LandingPageRenderRouterOutput = inferRouterOutputs<LandingPageRenderRouter>;

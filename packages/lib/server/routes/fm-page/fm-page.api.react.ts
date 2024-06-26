import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { createTRPCReact } from '@trpc/react-query';

import type { fmPageRouter } from './fm-page.router';

export type FmPageRouter = typeof fmPageRouter;

export const fmPageApi = createTRPCReact<FmPageRouter>();

export type FmPageRouterInputs = inferRouterInputs<FmPageRouter>;
export type FmPageRouterOutputs = inferRouterOutputs<FmPageRouter>;

import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { createTRPCReact } from '@trpc/react-query';

import type { cartRouter } from './cart.router';

export type CartRouter = typeof cartRouter;

export const cartApi = createTRPCReact<CartRouter>();

export type CartRouterInputs = inferRouterInputs<CartRouter>;
export type CartRouterOutputs = inferRouterOutputs<CartRouter>;

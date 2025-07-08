import type {
	inferRouterContext,
	inferRouterInputs,
	inferRouterOutputs,
} from '@trpc/server';
import { createTRPCRouter } from '@barely/lib/trpc';
import { cartRoute } from '@barely/lib/trpc/cart.route';

const cartRouter = createTRPCRouter(cartRoute);

type CartRouter = typeof cartRouter;
type CartRouterInputs = inferRouterInputs<CartRouter>;
type CartRouterOutputs = inferRouterOutputs<CartRouter>;
type CartRouterContext = inferRouterContext<CartRouter>;
type CartRouterKeys = keyof CartRouter;

export {
	cartRouter,
	type CartRouter,
	type CartRouterInputs,
	type CartRouterOutputs,
	type CartRouterContext,
	type CartRouterKeys,
};

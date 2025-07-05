import type {
	inferRouterContext,
	inferRouterInputs,
	inferRouterOutputs,
} from '@trpc/server';
import { createTRPCRouter } from '@barely/lib/trpc';
import { fmPageRoute } from '@barely/lib/trpc/fm-page.route';

const fmPageRouter = createTRPCRouter(fmPageRoute);

type FmPageRouter = typeof fmPageRouter;
type FmPageRouterInputs = inferRouterInputs<FmPageRouter>;
type FmPageRouterOutputs = inferRouterOutputs<FmPageRouter>;
type FmPageRouterContext = inferRouterContext<FmPageRouter>;
type FmPageRouterKeys = keyof FmPageRouter;

export {
	fmPageRouter,
	type FmPageRouter,
	type FmPageRouterInputs,
	type FmPageRouterOutputs,
	type FmPageRouterContext,
	type FmPageRouterKeys,
};

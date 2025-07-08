import type {
	inferRouterContext,
	inferRouterInputs,
	inferRouterOutputs,
} from '@trpc/server';
import { createTRPCRouter } from '@barely/lib/trpc';
import { emailManageRoute } from '@barely/lib/trpc/email-manage.route';

const emailManageRouter = createTRPCRouter(emailManageRoute);

type EmailManageRouter = typeof emailManageRouter;
type EmailManageRouterInputs = inferRouterInputs<EmailManageRouter>;
type EmailManageRouterOutputs = inferRouterOutputs<EmailManageRouter>;
type EmailManageRouterContext = inferRouterContext<EmailManageRouter>;
type EmailManageRouterKeys = keyof EmailManageRouter;

export {
	emailManageRouter,
	type EmailManageRouter,
	type EmailManageRouterInputs,
	type EmailManageRouterOutputs,
	type EmailManageRouterContext,
	type EmailManageRouterKeys,
};

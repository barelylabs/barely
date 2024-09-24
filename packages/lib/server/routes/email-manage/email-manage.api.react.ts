import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { createTRPCReact } from '@trpc/react-query';

import type { emailManageRouter } from './email-manage.router';

export type EmailManageRouter = typeof emailManageRouter;

export const emailManageApi = createTRPCReact<EmailManageRouter>();

export type EmailManageRouterInputs = inferRouterInputs<EmailManageRouter>;
export type EmailManageRouterOutputs = inferRouterOutputs<EmailManageRouter>;

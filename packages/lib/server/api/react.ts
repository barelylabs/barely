import { createTRPCReact } from '@trpc/react-query';

import type { AppRouter } from './router';

export const api = createTRPCReact<AppRouter>();

export { type AppRouterInputs, type AppRouterOutputs } from './router';

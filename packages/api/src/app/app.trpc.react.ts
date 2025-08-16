import { createTRPCContext } from '@trpc/tanstack-react-query';

import type { AppRouter } from './app.router';

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>();

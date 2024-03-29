import { createTRPCReact } from '@trpc/react-query';

import type { CombinedRouter } from './router.combined';

export const api = createTRPCReact<CombinedRouter>();

export {
	type CombinedRouterInputs as RouterInputs,
	type CombinedRouterOutputs as RouterOutputs,
} from './router.combined';

import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

import { domainNodeRouter } from '../domain.router.node';
import { workspaceNodeRouter } from '../workspace.router.node';
import { createTRPCRouter } from './trpc';

const nodeRouter = createTRPCRouter({
	domain: domainNodeRouter,
	workspace: workspaceNodeRouter,
});

type NodeRouter = typeof nodeRouter;
type NodeRouterInputs = inferRouterInputs<NodeRouter>;
type NodeRouterOutputs = inferRouterOutputs<NodeRouter>;

export { nodeRouter, type NodeRouter, type NodeRouterInputs, type NodeRouterOutputs };

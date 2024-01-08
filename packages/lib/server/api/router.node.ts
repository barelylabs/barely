import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

import { router } from '.';
import { domainNodeRouter } from '../domain.router.node';
import { workspaceNodeRouter } from '../workspace.router.node';

const nodeRouter = router({
	domain: domainNodeRouter,
	workspace: workspaceNodeRouter,
});

type NodeRouter = typeof nodeRouter;
type NodeRouterInputs = inferRouterInputs<NodeRouter>;
type NodeRouterOutputs = inferRouterOutputs<NodeRouter>;

export { nodeRouter, type NodeRouter, type NodeRouterInputs, type NodeRouterOutputs };

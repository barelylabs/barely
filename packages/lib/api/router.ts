import { edgeRouter } from './edge.router';
import { nodeRouter } from './node.router';
import { router } from './trpc';

const combinedRouter = router({
	node: nodeRouter,
	edge: edgeRouter,
});

// const flatRouter = mergeRouters(nodeRouter, edgeRouter);

type CombinedRouter = typeof combinedRouter;

export { combinedRouter, type CombinedRouter };

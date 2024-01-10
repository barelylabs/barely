import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { mergeRouters, router } from ".";
import { edgeRouter } from "./router.edge";
import { nodeRouter } from "./router.node";

const nodeRouterForMerge = router({
  node: nodeRouter,
});

const combinedRouter = mergeRouters(edgeRouter, nodeRouterForMerge);

type CombinedRouter = typeof combinedRouter;
type CombinedRouterInputs = inferRouterInputs<CombinedRouter>;
type CombinedRouterOutputs = inferRouterOutputs<CombinedRouter>;

export {
  combinedRouter,
  type CombinedRouter,
  type CombinedRouterInputs,
  type CombinedRouterOutputs,
};

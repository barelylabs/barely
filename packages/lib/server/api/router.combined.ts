import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { edgeRouter } from "./router.edge";
import { nodeRouter } from "./router.node";
import { createTRPCRouter, mergeRouters } from "./trpc";

const nodeRouterForMerge = createTRPCRouter({
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

import { edgeRouter } from "@barely/api/router.edge";
import { createTRPCContext } from "@barely/server/api";
import { createOpenApiNextHandler } from "trpc-openapi";

export const config = {
  runtime: "nodejs",
};

export default createOpenApiNextHandler({
  router: edgeRouter,
  createContext: ({ req }) => {
    console.log("creating context for rest api");
    return createTRPCContext({
      req: req as unknown as Request,
      rest: true,
      auth: null,
    });
  },
});

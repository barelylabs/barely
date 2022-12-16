import { appRouter } from "@barely/api";
import { createRscContext } from "@barely/api/src/context/rscContext";

export const createTRPCRsc = async () =>
  appRouter.createCaller(await createRscContext());

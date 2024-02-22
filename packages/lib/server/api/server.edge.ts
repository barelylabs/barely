import { cache } from "react";
import { headers } from "next/headers";

import { auth } from "../auth";
import { edgeRouter } from "./router.edge";
import { createCallerFactory, createTRPCContext } from "./trpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    session: await auth(),
    headers: heads,
  });
});

const createCaller = createCallerFactory(edgeRouter);

export const api = createCaller(createContext);

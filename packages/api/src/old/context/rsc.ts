import { type inferAsyncReturnType } from "@trpc/server";
import { cookies, headers } from "next/headers";

export type RscContext = inferAsyncReturnType<typeof createRscContext>;

export const createRscContext = async () => ({
  headers: headers(),
  cookies: cookies(),
});

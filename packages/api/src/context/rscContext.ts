import { type inferAsyncReturnType } from "@trpc/server";
import { prisma } from "@barely/db";
import { cookies, headers } from "next/headers";

export const createRscContext = async () => ({
  headers: headers(),
  cookies: cookies(),
  prisma,
});

export type RscContext = inferAsyncReturnType<typeof createRscContext>;

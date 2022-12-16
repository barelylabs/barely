import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

import { type ApiContext } from "./context/apiContext";
import { type RscContext } from "./context/rscContext";

type Context = ApiContext | RscContext;

export const isApiCtx = (ctx: Context): ctx is ApiContext =>
  "req" in ctx && "res" in ctx;

export const isRscCtx = (ctx: Context): ctx is RscContext =>
  "headers" in ctx && "cookies" in ctx;

export const isAuthedCtx = (ctx: Context): ctx is ApiContext =>
  "session" in ctx && ctx.session !== null;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

const isApi = t.middleware(({ ctx, next }) => {
  if (!isApiCtx(ctx))
    throw new TRPCError({
      code: "METHOD_NOT_SUPPORTED",
      message: "Procedure May Only Be Called Client-Side",
    });

  return next({ ctx });
});

const isRsc = t.middleware(({ ctx, next }) => {
  if (!isRscCtx(ctx))
    throw new TRPCError({
      code: "METHOD_NOT_SUPPORTED",
      message: "Procedure May Only Be Called Server-Side",
    });

  return next({ ctx });
});

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!isAuthedCtx(ctx)) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  return next({
    ctx: {
      session: ctx.session,
    },
  });
});

export const mergeRouters = t.mergeRouters;
export const middleware = t.middleware;
export const router = t.router;

export const procedure = t.procedure;
export const apiProcedure = procedure.use(isApi);
export const apiProtectedProcedure = apiProcedure.use(isAuthed);
export const rscProcedure = procedure.use(isRsc);

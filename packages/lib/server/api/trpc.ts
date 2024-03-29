/**
 * 🎬 INITIALIZATION
 */

import type { Session } from "next-auth";
import type { OpenApiMeta } from "trpc-openapi";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

// import type { SessionWorkspace } from "../auth";
import { ratelimit } from "../../utils/upstash";
/**
 * 🎁 CONTEXT
 */

import { db } from "../db";

const trpcSources = ["nextjs-react", "rsc", "rest"] as const;
type TRPCSource = (typeof trpcSources)[number];

export const createTRPCContext = async (opts: {
  headers: Headers;
  session: Session | null;
  rest?: boolean;
}) => {
  let session: Session | null = null;

  if (opts.session) {
    session = opts.session;
  } else if (!opts.rest) {
    const { auth } = await import("../auth");
    session = await auth();
    console.log("ssr session => ", session);
  }

  const source = opts.rest
    ? "rest"
    : trpcSources.includes(opts.headers.get("x-trpc-source") as TRPCSource)
      ? (opts.headers.get("x-trpc-source") as TRPCSource)
      : "unknown";

  const longitude = opts.rest
    ? undefined
    : opts.headers.get("x-longitude") ??
      opts.headers.get("x-vercel-ip-longitude") ??
      undefined;
  const latitude = opts.rest
    ? undefined
    : opts.headers.get("x-latitude") ??
      opts.headers.get("x-vercel-ip-latitude") ??
      undefined;

  const workspaceHandle = opts.rest
    ? undefined
    : opts.headers.get("x-workspace-handle") ?? null;

  const workspace = workspaceHandle
    ? session?.user.workspaces.find((w) => w.handle === workspaceHandle)
    : null;

  const pageSessionId = opts.rest
    ? undefined
    : opts.headers.get("x-page-session-id") ?? null;

  const pusherSocketId = opts.rest
    ? undefined
    : opts.headers.get("x-pusher-socket-id") ?? null;

  // console.log("pusherSocketId => ", pusherSocketId);

  const ip = opts.rest ? "" : opts.headers.get("x-real-ip") ?? "";

  const context = {
    // auth
    session: opts.session,
    user: opts.session?.user,
    workspace,
    pageSessionId,
    pusherSocketId,
    // pii
    ip,
    longitude,
    latitude,
    // for convenience
    db,
    source,
    ratelimit,
  };

  return context;
};

const t = initTRPC
  .meta<OpenApiMeta>()
  .context<typeof createTRPCContext>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zod:
            error.cause instanceof ZodError
              ? error.cause.flatten().fieldErrors
              : null,
        },
      };
    },
  });

/**
 * Create a server-side caller
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 🗺️ ROUTERS & PROCEDURES
 */

export const middleware = t.middleware;
export const createTRPCRouter = t.router;
export const mergeRouters = t.mergeRouters;

export const publicProcedure = t.procedure;
export const publicEdgeProcedure = publicProcedure.meta({
  edge: true,
});
export const privateProcedure = t.procedure.use((opts) => {
  if (!opts.ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "privateProcedure: Can't find that user in our database.",
    });
  }

  if (!opts.ctx.workspace) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Can't find that workspace in our database.",
    });
  }

  return opts.next({
    ctx: {
      user: opts.ctx.user,
      workspace: opts.ctx.workspace,
    },
  });
});

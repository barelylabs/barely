import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

import { insertAnalyticsEndpointSchema } from "./analytics-endpoint-schema";
import { AnalyticsEndpoints } from "./analytics-endpoint.sql";
import { privateProcedure, router } from "./api";

export const analyticsEndpointRouter = router({
  byCurrentWorkspace: privateProcedure.query(async ({ ctx }) => {
    if (!ctx.workspace)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `No workspaceId`,
      });

    const endpointsArray = await ctx.db.http.query.AnalyticsEndpoints.findMany({
      where: eq(AnalyticsEndpoints.workspaceId, ctx.workspace.id),
    });

    const endpointSet = {
      meta:
        endpointsArray.find((endpoint) => endpoint.platform === "meta") ?? null,
      google:
        endpointsArray.find((endpoint) => endpoint.platform === "google") ??
        null,
      snapchat:
        endpointsArray.find((endpoint) => endpoint.platform === "snapchat") ??
        null,
      tiktok:
        endpointsArray.find((endpoint) => endpoint.platform === "tiktok") ??
        null,
    };

    return endpointSet;
  }),

  update: privateProcedure
    .input(insertAnalyticsEndpointSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.workspace)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `No workspaceId`,
        });

      if (ctx.workspace.id !== input.workspaceId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `WorkspaceId mismatch`,
        });

      // upsert the endpoint
      const updatedEndpoint = await ctx.db.http
        .insert(AnalyticsEndpoints)
        .values(input)
        .onConflictDoUpdate({
          target: [AnalyticsEndpoints.workspaceId, AnalyticsEndpoints.platform],
          set: input,
        });

      return updatedEndpoint;
    }),
});

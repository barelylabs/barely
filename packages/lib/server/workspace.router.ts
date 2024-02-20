import { eq } from "drizzle-orm";
import { z } from "zod";

import { newId } from "../utils/id";
import { privateProcedure, publicProcedure, router } from "./api";
import { createPlanCheckoutLink } from "./stripe.fns";
import { _Users_To_Workspaces } from "./user.sql";
import {
  createWorkspaceSchema,
  updateCurrentWorkspaceSchema,
} from "./workspace.schema";
import { Workspaces } from "./workspace.sql";

export const workspaceRouter = router({
  current: privateProcedure.query(({ ctx }) => {
    if (!ctx.workspace) return null;
    return ctx.workspace;
  }),

  create: privateProcedure
    .input(createWorkspaceSchema)
    .mutation(async ({ ctx, input }) => {
      const workspaceId = newId("workspace");

      const newWorkspace = {
        id: newId("workspace"),
        ...input,
      };

      await ctx.db.pool.transaction(async (tx) => {
        await tx.insert(Workspaces).values({
          id: workspaceId,
          ...input,
        });
        await tx.insert(_Users_To_Workspaces).values({
          userId: ctx.user.id,
          workspaceId: workspaceId,
          role: "owner",
        });
      });

      return newWorkspace;
    }),

  bySpotifyId: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const artistTeam = await ctx.db.http.query.Workspaces.findFirst({
        where: eq(Workspaces.spotifyArtistId, input),
      });

      console.log("artistTeam => ", artistTeam);

      if (!artistTeam) return null;

      return artistTeam;
    }),

  spotifyArtistIdTaken: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const artistTeam = await ctx.db.http.query.Workspaces.findFirst({
        where: eq(Workspaces.spotifyArtistId, input),
      });

      return !!artistTeam;
    }),

  update: privateProcedure
    .input(updateCurrentWorkspaceSchema)
    .mutation(async ({ ctx, input }) => {
      const updatedWorkspace = await ctx.db.http
        .update(Workspaces)
        .set(input)
        .where(eq(Workspaces.id, ctx.workspace.id));

      return updatedWorkspace;
    }),

  createCheckoutLink: privateProcedure
    .input(
      z.object({
        planId: z.enum(["pro"]),
        billingCycle: z.enum(["monthly", "yearly"]),
        successPath: z.string().optional(),
        cancelPath: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const checkoutLink = await createPlanCheckoutLink({
        user: ctx.user,
        workspace: ctx.workspace,
        db: ctx.db,
        ...input,
      });

      return checkoutLink;
    }),
});

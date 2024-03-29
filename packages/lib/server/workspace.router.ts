import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { newId } from "../utils/id";
import { pushEvent } from "../utils/pusher-server";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "./api/trpc";
import {
  _Files_To_Workspaces__AvatarImage,
  _Files_To_Workspaces__HeaderImage,
} from "./file.sql";
import { createPlanCheckoutLink } from "./stripe.fns";
import { _Users_To_Workspaces } from "./user.sql";
import {
  createWorkspaceSchema,
  updateCurrentWorkspaceSchema,
} from "./workspace.schema";
import { Workspaces } from "./workspace.sql";

export const workspaceRouter = createTRPCRouter({
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

      await pushEvent("workspace", "update", {
        id: ctx.workspace.id,
        pageSessionId: ctx.pageSessionId,
        socketId: ctx.pusherSocketId,
      });

      return updatedWorkspace;
    }),

  updateAvatar: privateProcedure
    .input(
      z.object({
        avatarFileId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // check if there is already a default workspace avatar
      const defaultAvatar =
        await ctx.db.pool.query._Files_To_Workspaces__AvatarImage.findFirst({
          where: and(
            eq(_Files_To_Workspaces__AvatarImage.workspaceId, ctx.workspace.id),
            eq(_Files_To_Workspaces__AvatarImage.current, true),
          ),
        });

      // set the current default avatar to false
      if (defaultAvatar) {
        await ctx.db.pool
          .update(_Files_To_Workspaces__AvatarImage)
          .set({
            current: false,
          })
          .where(
            and(
              eq(
                _Files_To_Workspaces__AvatarImage.workspaceId,
                ctx.workspace.id,
              ),
            ),
          );
      }

      // set the new avatar as the default
      await ctx.db.pool
        .insert(_Files_To_Workspaces__AvatarImage)
        .values({
          workspaceId: ctx.workspace.id,
          fileId: input.avatarFileId,
          current: true,
        })
        .onConflictDoUpdate({
          target: [
            _Files_To_Workspaces__AvatarImage.workspaceId,
            _Files_To_Workspaces__AvatarImage.fileId,
          ],
          set: { current: true },
        });

      try {
        const pushRes = await pushEvent("workspace", "update", {
          id: ctx.workspace.id,
          pageSessionId: ctx.pageSessionId,
        });

        console.log("pushed event", pushRes);
      } catch (e) {
        console.error("e => ", e);
      }

      return true;
    }),

  updateHeader: privateProcedure
    .input(
      z.object({
        headerFileId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // check if there is already a default workspace header
      const defaultHeader =
        await ctx.db.pool.query._Files_To_Workspaces__HeaderImage.findFirst({
          where: and(
            eq(_Files_To_Workspaces__HeaderImage.workspaceId, ctx.workspace.id),
            eq(_Files_To_Workspaces__HeaderImage.current, true),
          ),
        });

      // set the current default header to false
      if (defaultHeader) {
        await ctx.db.pool
          .update(_Files_To_Workspaces__HeaderImage)
          .set({
            current: false,
          })
          .where(
            and(
              eq(
                _Files_To_Workspaces__HeaderImage.workspaceId,
                ctx.workspace.id,
              ),
            ),
          );
      }

      // set the new header as the default
      await ctx.db.pool
        .insert(_Files_To_Workspaces__HeaderImage)
        .values({
          workspaceId: ctx.workspace.id,
          fileId: input.headerFileId,
          current: true,
        })
        .onConflictDoUpdate({
          target: [
            _Files_To_Workspaces__HeaderImage.workspaceId,
            _Files_To_Workspaces__HeaderImage.fileId,
          ],
          set: { current: true },
        });

      try {
        const pushRes = await pushEvent("workspace", "update", {
          id: ctx.workspace.id,
          pageSessionId: ctx.pageSessionId,
        });

        console.log("pushed event", pushRes);
      } catch (e) {
        console.error("e => ", e);
      }

      return true;
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

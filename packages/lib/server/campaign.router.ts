import type { SQL } from "drizzle-orm";
import { sendEmail } from "@barely/email";
import { PlaylistPitchApprovedEmailTemplate } from "@barely/email/src/templates/playlist-pitch-approved";
import { PlaylistPitchRejectedEmailTemplate } from "@barely/email/src/templates/playlist-pitch-rejected";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import type { Track } from "./track.schema";
import type { Workspace } from "./workspace.schema";
import env from "../env";
// import { APP_BASE_URL } from "../utils/constants";
import { dbRead } from "../utils/db";
import { convertToHandle } from "../utils/handle";
import { newCuid, newId } from "../utils/id";
import { pushEvent } from "../utils/pusher-server";
import { sendText } from "../utils/sms";
import { sqlCount } from "../utils/sql";
import { privateProcedure, publicProcedure, router } from "./api";
import { createLoginLink } from "./auth/auth.fns";
import {
  createPlaylistPitchCampaign,
  getCampaignById,
  getCampaignsByUserId,
  getCampaignsByWorkspaceId,
} from "./campaign.fns";
import {
  createPlaylistPitchCampaignSchema,
  createUserAndPlaylistPitchCampaignSchema,
  selectCampaignSchema,
  updateCampaignSchema,
  updatePlaylistPitchCampaign_ScreeningSchema,
} from "./campaign.schema";
import { Campaigns, CampaignUpdateRecords } from "./campaign.sql";
import { createPitchCheckoutLink } from "./stripe.fns";
import { createTrack } from "./track.fns";
import { Tracks } from "./track.sql";
import { createUser } from "./user.fns";
import { _Users_To_Workspaces } from "./user.sql";
import { createWorkspace } from "./workspace.fns";
import { Workspaces } from "./workspace.sql";

export const campaignRouter = router({
  // CREATE
  createPlaylistPitch: privateProcedure
    .input(createPlaylistPitchCampaignSchema)
    .mutation(async ({ ctx, input }) => {
      console.log("createPlaylistPitch", input);

      // 🔎 check if artist exists

      if (!input.artist.spotifyArtistId && !input.artist.id)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Artist must have an id or spotifyArtistId",
        });

      let dbArtist = input.artist.id
        ? await ctx.db.read.query.Workspaces.findFirst({
            where: eq(Workspaces.id, input.artist.id),
            with: { _users: true },
          })
        : input.artist.spotifyArtistId
          ? await ctx.db.read.query.Workspaces.findFirst({
              where: eq(
                Workspaces.spotifyArtistId,
                input.artist.spotifyArtistId,
              ),
              with: { _users: true },
            })
          : null;

      // 👩‍💻 ↔️ 👩‍🎤 if artist exists, check if user is a member of the artist team

      if (dbArtist) {
        const userIsArtistAdmin = ctx.user.workspaces.some((w) => w.id);

        if (!userIsArtistAdmin) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: `You don't have access to ${input.artist.name}.`,
          });
        }
      }

      // 👩‍🎤 if artist doesn't exist, create new artist (team)

      if (!dbArtist) {
        const handle =
          input.artist.handle ?? convertToHandle(input.artist.name);

        const newArtistId = newId("workspace");

        await ctx.db.writePool.transaction(async (tx) => {
          await tx.insert(Workspaces).values({
            id: newArtistId,
            handle,
            name: input.artist.name,
            spotifyArtistId: input.artist.spotifyArtistId,
          });

          await tx.insert(_Users_To_Workspaces).values({
            workspaceId: newArtistId,
            userId: ctx.user.id,
          });
        });

        dbArtist = await ctx.db.read.query.Workspaces.findFirst({
          where: eq(Workspaces.id, newArtistId),
          with: { _users: true },
        });
      }

      if (!dbArtist) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Something went wrong creating ${input.artist.name}.`,
        });
      }

      // 💿 check if track exists

      let dbTrack = input.track.id
        ? await ctx.db.read.query.Tracks.findFirst({
            where: eq(Tracks.id, input.track.id),
          })
        : input.track.spotifyId
          ? await ctx.db.read.query.Tracks.findFirst({
              where: eq(Tracks.spotifyId, input.track.spotifyId),
            })
          : null;

      // 💿 if track doesn't exist, create new track

      if (!dbTrack)
        dbTrack = await createTrack(
          { ...input.track, workspaceId: dbArtist.id },
          ctx.db,
        );

      if (!dbTrack)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Something went wrong creating ${input.track.name}.`,
        });

      // 🚀 create campaign

      const newCampaign = await createPlaylistPitchCampaign({
        user: ctx.user,
        trackId: dbTrack.id,
        db: ctx.db,
      });

      return newCampaign;
    }),

  createUserAndPlaylistPitch: publicProcedure
    .input(createUserAndPlaylistPitchCampaignSchema)
    .mutation(async ({ input, ctx }) => {
      console.log("createUserAndPlaylistPitch", input);

      // 🙋‍♂️ create user
      const newUser = await createUser(input.user, ctx.db);

      // 🔎 check if artist already exists in db
      if (input.artist.spotifyArtistId) {
        const spotifyArtistId = input.artist.spotifyArtistId;
        const dbArtistCheck = await ctx.db.read.query.Workspaces.findFirst({
          where: eq(Workspaces.spotifyArtistId, spotifyArtistId),
        });

        if (dbArtistCheck)
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: `You don't have access to ${input.artist.name}.`,
          });
      }

      let artistHandle =
        input.artist.handle ?? convertToHandle(input.artist.name);

      // check if handle is available
      let existingArtistHandle = await dbRead(ctx.db)
        .query.Workspaces.findFirst({
          where: eq(Workspaces.handle, artistHandle),
        })
        .then((w) => w?.handle);

      // if handle is taken, append a number to the end
      if (existingArtistHandle) {
        let i = 1;

        while (existingArtistHandle) {
          artistHandle = `${existingArtistHandle}${i}`;
          existingArtistHandle = await dbRead(ctx.db)
            .query.Workspaces.findFirst({
              where: eq(Workspaces.handle, artistHandle),
            })
            .then((w) => w?.handle);

          if (existingArtistHandle) console.log("handle taken ", artistHandle);
          if (!existingArtistHandle)
            console.log("handle available ", artistHandle);
          if (i > 100) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
          i++;
        }
      }

      console.log("new artist handle", artistHandle);

      let newWorkspace: Workspace | undefined;
      let newTrack: Track | undefined;

      await ctx.db.writePool.transaction(async (tx) => {
        // 👩‍🎤 create new workspace
        newWorkspace = await createWorkspace(
          {
            workspace: {
              handle: artistHandle,
              name: input.artist.name,
              spotifyArtistId: input.artist.spotifyArtistId,
            },
            creatorId: newUser.id,
          },
          ctx.db,
          tx,
        );

        if (!newWorkspace)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong creating the artist.",
          });
        // 💿 create new track
        newTrack = await createTrack(
          { ...input.track, workspaceId: newWorkspace.id },
          ctx.db,
          tx,
        );
      });

      if (!newTrack)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong creating the track.",
        });

      const newCampaign = createPlaylistPitchCampaign({
        user: newUser,
        trackId: newTrack.id,
        sendConfirmationEmail: true,
        db: ctx.db,
      });

      return newCampaign;
    }),

  createPlaylistPitchCheckoutLink: privateProcedure
    .input(
      z.object({
        campaignId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { campaignId } = input;

      const campaign = await getCampaignById(campaignId, ctx.db);

      if (!campaign)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });
      if (!campaign.track)
        throw new TRPCError({ code: "NOT_FOUND", message: "Track not found" });

      const checkoutLink = await createPitchCheckoutLink({
        db: ctx.db,
        user: ctx.user,
        campaign,
      });

      return checkoutLink;
    }),

  // GET

  byId: publicProcedure
    .input(z.string())
    .query(async ({ input: campaignId, ctx }) => {
      console.log("fetching campaign", campaignId);
      const campaign = await getCampaignById(campaignId, ctx.db);
      if (!campaign) throw new TRPCError({ code: "NOT_FOUND" });
      return campaign;
    }),

  byUser: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).nullish(),
        cursor: z.string().nullish(),
        type: selectCampaignSchema.shape.type.optional(),
        stage: selectCampaignSchema.shape.stage.optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 20;

      const campaigns = await getCampaignsByUserId(ctx.user.id, ctx.db, {
        type: input.type,
        stage: input.stage,
        limit,
      });

      let nextCursor: typeof input.cursor | undefined = undefined;

      if (campaigns.length > limit) {
        const nextCampaign = campaigns.pop();
        nextCursor = nextCampaign?.createdAt;
      }

      return {
        campaigns,
        nextCursor,
      };
    }),

  byWorkspaceId: privateProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        limit: z.number().min(1).max(50).nullish(),
        cursor: z.string().nullish(),
        type: selectCampaignSchema.shape.type.optional(),
        stage: selectCampaignSchema.shape.stage.optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 20;

      const campaigns = await getCampaignsByWorkspaceId(
        input.workspaceId,
        ctx.db,
        {
          type: input.type,
          stage: input.stage,
          limit,
        },
      );

      let nextCursor: typeof input.cursor | undefined = undefined;

      if (campaigns.length > limit) {
        const nextCampaign = campaigns.pop();
        nextCursor = nextCampaign?.createdAt;
      }

      return {
        campaigns,
        nextCursor,
      };
    }),

  countByUser: privateProcedure
    .input(
      z.object({
        type: selectCampaignSchema.shape.type.optional(),
        stage: selectCampaignSchema.shape.stage.optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: SQL[] = [
        inArray(
          Campaigns.workspaceId,
          ctx.user.workspaces.map((w) => w.id),
        ),
      ];

      if (input.type) where.push(eq(Campaigns.type, input.type));
      if (input.stage) where.push(eq(Campaigns.stage, input.stage));

      const campaignsWithCount = await ctx.db.read
        .select({
          count: sqlCount,
        })
        .from(Campaigns)
        .where(and(...where))
        .limit(1)
        .then((c) => c[0]);

      if (!campaignsWithCount) throw new TRPCError({ code: "NOT_FOUND" });

      return campaignsWithCount.count;
    }),

  countByWorkspaceId: privateProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        type: selectCampaignSchema.shape.type.optional(),
        stage: selectCampaignSchema.shape.stage.optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: SQL[] = [eq(Campaigns.workspaceId, input.workspaceId)];

      if (input.type) where.push(eq(Campaigns.type, input.type));

      const [all, active, screening, approved] = await Promise.allSettled([
        ctx.db.readPool
          .select({
            count: sqlCount,
          })
          .from(Campaigns)
          .where(and(...where))
          .limit(1)
          .then((c) => (c[0] ? c[0].count : 0)),
        ctx.db.readPool
          .select({
            count: sqlCount,
          })
          .from(Campaigns)
          .where(and(...where, eq(Campaigns.stage, "active")))
          .limit(1)
          .then((c) => (c[0] ? c[0].count : 0)),
        ctx.db.readPool
          .select({
            count: sqlCount,
          })
          .from(Campaigns)
          .where(and(...where, eq(Campaigns.stage, "screening")))
          .limit(1)
          .then((c) => (c[0] ? c[0].count : 0)),
        ctx.db.readPool
          .select({
            count: sqlCount,
          })
          .from(Campaigns)
          .where(and(...where, eq(Campaigns.stage, "approved")))
          .limit(1)
          .then((c) => (c[0] ? c[0].count : 0)),
      ]);

      return {
        all: all.status === "fulfilled" ? all.value : 0,
        active: active.status === "fulfilled" ? active.value : 0,
        screening: screening.status === "fulfilled" ? screening.value : 0,
        approved: approved.status === "fulfilled" ? approved.value : 0,
      };
    }),

  toScreen: privateProcedure.query(async ({ ctx }) => {
    if (!ctx.user.pitchScreening)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User is not authorized to screen campaigns.",
      });

    const campaigns = await ctx.db.read.query.Campaigns.findMany({
      where: eq(Campaigns.stage, "screening"),
      orderBy: [asc(Campaigns.createdAt)],
      with: {
        track: {
          with: {
            workspace: true,
            _genres: {
              with: {
                genre: true,
              },
            },
          },
        },
      },
      limit: 2,
    });

    console.log("campaignsToScreen ", campaigns);

    return campaigns.map((c) => ({
      ...c,
      track: {
        ...c.track,
        genres: c.track._genres.map((_g) => _g.genre),
      },
    }));
  }),

  // UPDATE

  submitPlaylistPitchScreening: privateProcedure
    .input(updatePlaylistPitchCampaign_ScreeningSchema)
    .mutation(async ({ ctx, input: rawInput }) => {
      console.log("submitting playlist.pitch screening on server");

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { genres, ...input } = rawInput;

      await ctx.db.write
        .update(Campaigns)
        .set(input)
        .where(eq(Campaigns.id, input.id));

      const campaign = await ctx.db.read.query.Campaigns.findFirst({
        where: eq(Campaigns.id, input.id),
        with: {
          createdBy: true,
          workspace: true,
          track: true,
        },
      });

      console.log("campaign => ", campaign);
      if (!campaign)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });

      await ctx.db.write.insert(CampaignUpdateRecords).values({
        id: newCuid(),
        campaignId: input.id,
        createdById: ctx.user.id,
        stage: input.stage ?? campaign.stage,
      });

      if (input.stage === "rejected") {
        await sendEmail({
          from: "support@barely.io",
          to: campaign.createdBy.email,
          subject: `Your playlist.pitch campaign for ${campaign.track.name} wasn't approved`,
          react: PlaylistPitchRejectedEmailTemplate({
            firstName:
              campaign.createdBy.firstName ??
              campaign.createdBy.handle ??
              undefined,
            trackName: campaign.track.name,
            screeningMessage: input.screeningMessage,
          }),
          type: "transactional",
        });
      }

      if (input.stage === "approved") {
        // set the curator reach to the minimum if it's not set yet
        if (!campaign.curatorReach) {
          await ctx.db.write
            .update(Campaigns)
            .set({ curatorReach: 3 })
            .where(eq(Campaigns.id, input.id));
        }

        // send email to the user that created the campaign
        const emailLoginLink = await createLoginLink({
          provider: "email",
          identifier: campaign.createdBy.email,
          callbackUrl: `${env.NEXT_PUBLIC_APP_BASE_URL}/${campaign.workspace.handle}/campaign/${campaign.id}/launch`,
        });

        console.log("sending pitch approved email");
        await sendEmail({
          from: "support@barely.io",
          to: campaign.createdBy.email,
          subject: `Your playlist.pitch campaign for ${campaign.track.name} is approved!`,
          react: PlaylistPitchApprovedEmailTemplate({
            firstName:
              campaign.createdBy.firstName ??
              campaign.createdBy.handle ??
              undefined,
            trackName: campaign.track.name,
            loginLink: emailLoginLink,
            screeningMessage: input.screeningMessage,
          }),
          type: "transactional",
        });

        // send text to the user that created the campaign
        console.log("sending pitch approved text");
        if (campaign.createdBy.phone) {
          console.log("campaign.createdBy.phone", campaign.createdBy.phone);

          const phoneLoginLink = await createLoginLink({
            provider: "phone",
            identifier: campaign.createdBy.phone,
            callbackUrl: `${env.NEXT_PUBLIC_APP_BASE_URL}/${campaign.workspace.handle}/campaigns/${campaign.id}/launch`,
          });

          console.log("phoneLoginLink", phoneLoginLink);

          const text = await sendText({
            to: campaign.createdBy.phone,
            body: `Your playlist.pitch for ${campaign.track.name} has been approved! Click the link below to launch your campaign. ${phoneLoginLink}`,
          });

          console.log("text", text);
        }
      }
    }),

  update: privateProcedure
    .input(updateCampaignSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.write
        .update(Campaigns)
        .set(input)
        .where(eq(Campaigns.id, input.id));

      const campaign = await ctx.db.read.query.Campaigns.findFirst({
        where: eq(Campaigns.id, input.id),
        with: {
          createdBy: true,
          track: {
            with: {
              workspace: true,
            },
          },
        },
      });

      if (!campaign)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });

      await ctx.db.write.insert(CampaignUpdateRecords).values({
        id: newCuid(),
        campaignId: input.id,
        createdById: ctx.user.id,
        stage: input.stage ?? campaign.stage,
      });

      // await pusher.trigger('campaigns', `updated-${campaign.id}`, {
      // 	pageSessionId: ctx.pageSessionId,
      // });

      await pushEvent("campaign", "update", {
        id: campaign.id,
        pageSessionId: ctx.pageSessionId,
      });

      return campaign;
    }),
});

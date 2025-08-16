import type { InsertTrack, Workspace } from '@barely/validators';
import type { TRPCRouterRecord } from '@trpc/server';
import type { SQL } from 'drizzle-orm';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import {
	_Users_To_Workspaces,
	Campaigns,
	CampaignUpdateRecords,
	Tracks,
	Workspaces,
} from '@barely/db/sql';
import { sqlCount } from '@barely/db/utils';
import { sendEmail } from '@barely/email';
import {
	PlaylistPitchApprovedEmailTemplate,
	PlaylistPitchRejectedEmailTemplate,
} from '@barely/email/templates/playlist-pitch';
import { convertToHandle, newCuid, newId, raiseTRPCError } from '@barely/utils';
import {
	createPlaylistPitchCampaignSchema,
	createUserAndPlaylistPitchCampaignSchema,
	selectCampaignSchema,
	updateCampaignSchema,
	updatePlaylistPitchCampaign_ScreeningSchema,
} from '@barely/validators';
import { TRPCError } from '@trpc/server';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { z } from 'zod/v4';

import { createMagicLink } from '@barely/auth/utils';

import {
	createPitchCheckoutLink,
	createPlaylistPitchCampaign,
	getCampaignById,
	getCampaignsByUserId,
	getCampaignsByWorkspaceId,
} from '../../functions/campaign.fns';
import { createTrack } from '../../functions/track.fns';
import { createUser, getSessionUserByUserId } from '../../functions/user.fns';
import { createWorkspace } from '../../functions/workspace.fns';
import { pushEvent } from '../../integrations/pusher/pusher-server';
import { sendText } from '../../utils/sms';
import { privateProcedure, publicProcedure, workspaceProcedure } from '../trpc';

export const campaignRoute = {
	// CREATE
	createPlaylistPitch: workspaceProcedure
		.input(createPlaylistPitchCampaignSchema)
		.mutation(async ({ ctx, input }) => {
			// 🔎 check if artist exists

			if (!input.artist.spotifyArtistId && !input.artist.id)
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Artist must have an id or spotifyArtistId',
				});

			let dbArtist =
				input.artist.id ?
					await dbHttp.query.Workspaces.findFirst({
						where: eq(Workspaces.id, input.artist.id),
						with: { _users: true },
					})
				: input.artist.spotifyArtistId ?
					await dbHttp.query.Workspaces.findFirst({
						where: eq(Workspaces.spotifyArtistId, input.artist.spotifyArtistId),
						with: { _users: true },
					})
				:	null;

			// 👩‍💻 ↔️ 👩‍🎤 if artist exists, check if user is a member of the artist team

			if (dbArtist) {
				const userIsArtistAdmin = ctx.workspaces.some(w => w.id);

				if (!userIsArtistAdmin) {
					throw new TRPCError({
						code: 'UNAUTHORIZED',
						message: `You don't have access to ${input.artist.name}.`,
					});
				}
			}

			// 👩‍🎤 if artist doesn't exist, create new artist (team)

			if (!dbArtist) {
				const handle = input.artist.handle ?? convertToHandle(input.artist.name);

				const newArtistId = newId('workspace');

				await dbPool(ctx.pool).transaction(async tx => {
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

				dbArtist = await dbHttp.query.Workspaces.findFirst({
					where: eq(Workspaces.id, newArtistId),
					with: { _users: true },
				});
			}

			if (!dbArtist) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: `Something went wrong creating ${input.artist.name}.`,
				});
			}

			// 💿 check if track exists

			let dbTrack =
				input.track.id ?
					await dbHttp.query.Tracks.findFirst({
						where: eq(Tracks.id, input.track.id),
					})
				: input.track.spotifyId ?
					await dbHttp.query.Tracks.findFirst({
						where: eq(Tracks.spotifyId, input.track.spotifyId),
					})
				:	null;

			// 💿 if track doesn't exist, create new track

			dbTrack ??= await createTrack(input.track, dbArtist.id, ctx.pool);

			if (!dbTrack)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: `Something went wrong creating ${input.track.name}.`,
				});

			// 🚀 create campaign

			const newCampaign = await createPlaylistPitchCampaign({
				user: ctx.user,
				trackId: dbTrack.id,
				pool: ctx.pool,
			});

			return newCampaign;
		}),

	createUserAndPlaylistPitch: publicProcedure
		.input(createUserAndPlaylistPitchCampaignSchema)
		.mutation(async ({ input, ctx }) => {
			console.log('createUserAndPlaylistPitch', input);

			// 🙋‍♂️ create user
			const newUser = await createUser(input.user);

			// 🔎 check if artist already exists in db
			if (input.artist.spotifyArtistId) {
				const spotifyArtistId = input.artist.spotifyArtistId;
				const dbArtistCheck = await dbHttp.query.Workspaces.findFirst({
					where: eq(Workspaces.spotifyArtistId, spotifyArtistId),
				});

				if (dbArtistCheck)
					throw new TRPCError({
						code: 'UNAUTHORIZED',
						message: `You don't have access to ${input.artist.name}.`,
					});
			}

			let artistHandle = input.artist.handle ?? convertToHandle(input.artist.name);

			// check if handle is available
			let existingArtistHandle = await dbHttp.query.Workspaces.findFirst({
				where: eq(Workspaces.handle, artistHandle),
			}).then(w => w?.handle);

			// if handle is taken, append a number to the end
			if (existingArtistHandle) {
				let i = 1;

				while (existingArtistHandle) {
					artistHandle = `${existingArtistHandle}${i}`;
					existingArtistHandle = await dbHttp.query.Workspaces.findFirst({
						where: eq(Workspaces.handle, artistHandle),
					}).then(w => w?.handle);

					if (existingArtistHandle) console.log('handle taken ', artistHandle);
					if (!existingArtistHandle) console.log('handle available ', artistHandle);
					if (i > 100) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
					i++;
				}
			}

			console.log('new artist handle', artistHandle);

			let newWorkspace: Workspace | undefined;
			let newTrack: InsertTrack | undefined;

			await dbPool(ctx.pool).transaction(async tx => {
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
					ctx.pool,
					tx,
				);

				if (!newWorkspace)
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Something went wrong creating the artist.',
					});
				// 💿 create new track
				newTrack =
					(await createTrack(input.track, newWorkspace.id, ctx.pool, tx)) ?? undefined;
			});

			if (!newTrack)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Something went wrong creating the track.',
				});

			if (!newWorkspace)
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Something went wrong creating the artist.',
				});

			// const newSessionUser: SessionUser = {
			// 	...newUser,
			// 	workspaces: [
			// 		{
			// 			...newWorkspace,
			// 			role: 'admin',
			// 		},
			// 	],
			// };

			const newSessionUser =
				(await getSessionUserByUserId(newUser.id)) ??
				raiseTRPCError({ message: 'no user found' });

			const newCampaign = createPlaylistPitchCampaign({
				user: newSessionUser,
				trackId: newTrack.id,
				sendConfirmationEmail: true,
				pool: ctx.pool,
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

			const campaign = await getCampaignById(campaignId);

			// if (!campaign)
			// 	throw new TRPCError({
			// 		code: 'NOT_FOUND',
			// 		message: 'Campaign not found',
			// 	});
			// if (!campaign.track)
			// 	throw new TRPCError({ code: 'NOT_FOUND', message: 'Track not found' });

			const checkoutLink = await createPitchCheckoutLink({
				user: ctx.user,
				workspace: campaign.workspace,
				campaign,
			});

			return checkoutLink;
		}),

	// GET

	byId: publicProcedure
		.input(z.object({ campaignId: z.string() }))
		.query(async ({ input: { campaignId } }) => {
			console.log('fetching campaign', campaignId);
			const campaign = await getCampaignById(campaignId);
			return campaign;
		}),

	byUser: privateProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(50).nullish(),
				cursor: z.coerce.date().nullish(),
				type: selectCampaignSchema.shape.type.optional(),
				stage: selectCampaignSchema.shape.stage.optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const limit = input.limit ?? 20;

			const campaigns = await getCampaignsByUserId(ctx.user.id, ctx.pool, {
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

	byHandle: privateProcedure
		.input(
			z.object({
				handle: z.string(),
				limit: z.number().min(1).max(50).nullish(),
				cursor: z.coerce.date().nullish(),
				type: selectCampaignSchema.shape.type.optional(),
				stage: selectCampaignSchema.shape.stage.optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const limit = input.limit ?? 20;

			const workspaceId = ctx.workspaces.find(w => w.handle === input.handle)?.id;

			if (!workspaceId)
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Workspace not found',
				});

			const campaigns = await getCampaignsByWorkspaceId(workspaceId, ctx.pool, {
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
					ctx.user.workspaces.map(w => w.id),
				),
			];

			if (input.type) where.push(eq(Campaigns.type, input.type));
			if (input.stage) where.push(eq(Campaigns.stage, input.stage));

			const campaignsWithCount = await dbHttp
				.select({
					count: sqlCount,
				})
				.from(Campaigns)
				.where(and(...where))
				.limit(1)
				.then(c => c[0]);

			if (!campaignsWithCount) throw new TRPCError({ code: 'NOT_FOUND' });

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
				dbPool(ctx.pool)
					.select({
						count: sqlCount,
					})
					.from(Campaigns)
					.where(and(...where))
					.limit(1)
					.then(c => (c[0] ? c[0].count : 0)),
				dbPool(ctx.pool)
					.select({
						count: sqlCount,
					})
					.from(Campaigns)
					.where(and(...where, eq(Campaigns.stage, 'active')))
					.limit(1)
					.then(c => (c[0] ? c[0].count : 0)),
				dbPool(ctx.pool)
					.select({
						count: sqlCount,
					})
					.from(Campaigns)
					.where(and(...where, eq(Campaigns.stage, 'screening')))
					.limit(1)
					.then(c => (c[0] ? c[0].count : 0)),
				dbPool(ctx.pool)
					.select({
						count: sqlCount,
					})
					.from(Campaigns)
					.where(and(...where, eq(Campaigns.stage, 'approved')))
					.limit(1)
					.then(c => (c[0] ? c[0].count : 0)),
			]);

			return {
				all: all.status === 'fulfilled' ? all.value : 0,
				active: active.status === 'fulfilled' ? active.value : 0,
				screening: screening.status === 'fulfilled' ? screening.value : 0,
				approved: approved.status === 'fulfilled' ? approved.value : 0,
			};
		}),

	toScreen: privateProcedure.query(async ({ ctx }) => {
		if (!ctx.user.pitchScreening)
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'User is not authorized to screen campaigns.',
			});

		const campaigns = await dbHttp.query.Campaigns.findMany({
			where: eq(Campaigns.stage, 'screening'),
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

		console.log('campaignsToScreen ', campaigns);

		return campaigns.map(c => ({
			...c,
			track: {
				...c.track,
				genres: c.track._genres.map(_g => _g.genre),
			},
		}));
	}),

	// UPDATE

	submitPlaylistPitchScreening: privateProcedure
		.input(updatePlaylistPitchCampaign_ScreeningSchema)
		.mutation(async ({ ctx, input: rawInput }) => {
			console.log('submitting playlist.pitch screening on server');

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { genres, ...input } = rawInput;

			await dbHttp.update(Campaigns).set(input).where(eq(Campaigns.id, input.id));

			const campaign = await dbHttp.query.Campaigns.findFirst({
				where: eq(Campaigns.id, input.id),
				with: {
					createdBy: true,
					workspace: true,
					track: true,
				},
			});

			console.log('campaign => ', campaign);
			if (!campaign)
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Campaign not found',
				});

			await dbHttp.insert(CampaignUpdateRecords).values({
				id: newCuid(),
				campaignId: input.id,
				createdById: ctx.user.id,
				stage: input.stage,
			});

			if (input.stage === 'rejected') {
				await sendEmail({
					from: 'support@ship.barely.ai',
					to: campaign.createdBy.email,
					subject: `Your playlist.pitch campaign for ${campaign.track.name} wasn't approved`,
					react: PlaylistPitchRejectedEmailTemplate({
						firstName:
							campaign.createdBy.firstName ?? campaign.createdBy.handle ?? undefined,
						trackName: campaign.track.name,
						screeningMessage: input.screeningMessage,
					}),
					type: 'transactional',
				});
			}

			if (input.stage === 'approved') {
				// set the curator reach to the minimum if it's not set yet
				if (!campaign.curatorReach) {
					await dbHttp
						.update(Campaigns)
						.set({ curatorReach: 3 })
						.where(eq(Campaigns.id, input.id));
				}

				// send email to the user that created the campaign
				// const user =
				// 	(await getSessionUserByUserId(campaign.createdBy.id)) ??
				// 	raiseTRPCError({ message: 'no user found for that campaign' });
				const { magicLink } = await createMagicLink({
					// user,
					// provider: 'email',
					// identifier: campaign.createdBy.email,
					email: campaign.createdBy.email,
					callbackPath: `${campaign.workspace.handle}/campaign/${campaign.id}/launch`,
				});

				console.log('sending pitch approved email');
				await sendEmail({
					from: 'support@ship.barely.ai',
					to: campaign.createdBy.email,
					subject: `Your playlist.pitch campaign for ${campaign.track.name} is approved!`,
					react: PlaylistPitchApprovedEmailTemplate({
						firstName:
							campaign.createdBy.firstName ?? campaign.createdBy.handle ?? undefined,
						trackName: campaign.track.name,
						loginLink: magicLink,
						screeningMessage: input.screeningMessage,
					}),
					type: 'transactional',
				});

				// send text to the user that created the campaign
				console.log('sending pitch approved text');
				if (campaign.createdBy.phone) {
					console.log('campaign.createdBy.phone', campaign.createdBy.phone);

					// const phoneLoginLink = await createMagicLink({
					// 	user,
					// 	provider: 'phone',
					// 	identifier: campaign.createdBy.phone,
					// 	callbackPath: `${campaign.workspace.handle}/campaigns/${campaign.id}/launch`,
					// });

					const phoneLoginLink = 'app.barely.ai'; // fixme when we start using sms

					console.log('phoneLoginLink', phoneLoginLink);

					const text = await sendText({
						to: campaign.createdBy.phone,
						body: `Your playlist.pitch for ${campaign.track.name} has been approved! Click the link below to launch your campaign. ${phoneLoginLink}`,
					});

					console.log('text', text);
				}
			}
		}),

	update: privateProcedure
		.input(updateCampaignSchema)
		.mutation(async ({ ctx, input }) => {
			await dbHttp.update(Campaigns).set(input).where(eq(Campaigns.id, input.id));

			const campaign = await dbHttp.query.Campaigns.findFirst({
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
					code: 'NOT_FOUND',
					message: 'Campaign not found',
				});

			await dbHttp.insert(CampaignUpdateRecords).values({
				id: newCuid(),
				campaignId: input.id,
				createdById: ctx.user.id,
				stage: input.stage ?? campaign.stage,
			});

			// await pusher.trigger('campaigns', `updated-${campaign.id}`, {
			// 	pageSessionId: ctx.pageSessionId,
			// });

			await pushEvent('campaign', 'update', {
				id: campaign.id,
				pageSessionId: ctx.pageSessionId,
				socketId: ctx.pusherSocketId,
			});

			return campaign;
		}),
} satisfies TRPCRouterRecord;

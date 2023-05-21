import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { prisma } from '@barely/db';
import { sendEmail } from '@barely/email';
import { PlaylistPitchApprovedEmailTemplate } from '@barely/email/templates/playlist-pitch-approved';

import env from '../../env';
import { sendText } from '../../sms';
import { createLoginLink } from '../auth/auth.node.fns';
import { pusher } from '../pusher';
import { createPitchCheckoutLink } from '../stripe/stripe.node.fns';
import { privateProcedure, publicProcedure, router } from '../trpc';
import { createUser } from '../user/user.node.fns';
import { createPlaylistPitchCampaign, getCampaignById } from './campaign.node.fns';
import {
	campaignStageSchema,
	campaignTypeSchema,
	campaignUpdateSchema,
	existingUserCreatePlaylistPitchSchema,
	newUserCreatePlaylistPitchSchema,
} from './campaign.schema';

export const campaignRouter = router({
	// CREATE
	createUserAndPlaylistPitch: publicProcedure
		.input(newUserCreatePlaylistPitchSchema)
		.mutation(async ({ input }) => {
			const { artist, track, user } = input;

			console.log('createUserAndPlaylistPitch', input);

			// 🙋‍♂️ create user
			const newUser = await createUser(user);

			// 🔎 check if artist already exists in db

			const dbArtistCheck = artist.spotifyArtistId
				? await prisma.team.findUnique({
						where: {
							spotifyArtistId: artist.spotifyArtistId,
						},
				  })
				: null;

			// ✋ if artist exists, something went wrong.
			// This is a new user, so they shouldn't have access to any existing artists yet.

			if (dbArtistCheck) {
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: `You don't have access to ${artist.name}.`,
				});
			}

			// 👩‍🎤 create new artist (team)

			const handle = artist.handle ?? artist.name.toLowerCase().replace(/[^a-z0-9]/g, '');

			const newArtist = await prisma.team.create({
				data: {
					handle,
					name: artist.name,
					spotifyArtistId: artist.spotifyArtistId,
					members: {
						create: {
							role: 'owner',
							user: { connect: { id: newUser.id } },
						},
					},
				},
			});

			// 💿 create new track

			const newTrack = await prisma.track.create({
				data: {
					name: track.name,
					spotifyId: track.spotifyId,
					released: track.released,
					imageUrl: track.imageUrl,
					team: { connect: { id: newArtist.id } },
				},
			});

			// 🚀 create campaign

			const newCampaign = createPlaylistPitchCampaign({
				user: newUser,
				track: newTrack,
				sendConfirmationEmail: true,
			});
			// const newCampaign = await prisma.campaign.create({
			// 	data: {
			// 		type: 'playlistPitch',
			// 		stage: 'screening',
			// 		createdBy: { connect: { id: newUser.id } },
			// 		track: { connect: { id: newTrack.id } },
			// 	},
			// });

			// // 📧 send email/text to A&R team for screening

			// await sendEmail({
			// 	from: 'support@barely.io',
			// 	to: 'adam@barelysparrow.com',
			// 	subject: 'New campaign for screening',
			// 	type: 'transactional',
			// 	template: PlaylistPitchToScreenEmailTemplate({
			// 		firstName: 'Adam',
			// 		loginLink: `${env.NEXT_PUBLIC_APP_BASE_URL}/screen`,
			// 	}),
			// });

			// await sendText({
			// 	to: env.SCREENING_PHONE_NUMBER,
			// 	body: `New campaign for screening: ${newCampaign.id}`,
			// });

			// // 📧 send email to user to verify email

			// const userConfirmEmailLink = await createLoginLink({
			// 	provider: 'email',
			// 	identifier: user.email,
			// 	callbackUrl: `${env.NEXT_PUBLIC_APP_BASE_URL}/campaigns`,
			// });

			// await sendEmail({
			// 	from: 'support@barely.io',
			// 	to: user.email,
			// 	subject: `Confirm your playlist.pitch submission for ${newTrack.name}`,
			// 	template: PlaylistPitchConfirmEmailTemplate({
			// 		firstName: newUser.firstName ?? undefined,
			// 		trackName: newTrack.name,
			// 		loginLink: userConfirmEmailLink,
			// 	}),

			// 	type: 'transactional',
			// });

			return newCampaign;
		}),

	createPlaylistPitch: privateProcedure
		.input(existingUserCreatePlaylistPitchSchema)
		.mutation(async ({ ctx, input }) => {
			const { artist, track } = input;

			console.log('createPlaylistPitch', input);

			// 🙋‍♂️ get user

			const user = ctx.user;

			// 🔎 check if artist exists

			let dbArtist = await prisma.team.findFirst({
				where: {
					OR: [{ id: artist.id }, { spotifyArtistId: artist.spotifyArtistId }],
				},
				include: { members: true },
			});

			// 👩‍💻 ↔️ 👩‍🎤 if artist exists, check if user is a member of the artist team

			if (dbArtist) {
				const userIsArtistAdmin = dbArtist.members.some(
					member =>
						member.userId === user.id &&
						(member.role === 'owner' || member.role === 'admin'),
				);

				if (!userIsArtistAdmin) {
					throw new TRPCError({
						code: 'UNAUTHORIZED',
						message: `You don't have access to ${artist.name}.`,
					});
				}
			}

			// 👩‍🎤 if artist doesn't exist, create new artist (team)

			if (!dbArtist) {
				const handle =
					artist.handle ?? artist.name.toLowerCase().replace(/[^a-z0-9]/g, '');

				dbArtist = await prisma.team.create({
					data: {
						handle,
						name: artist.name,
						spotifyArtistId: artist.spotifyArtistId,
						members: {
							create: {
								role: 'owner',
								user: { connect: { id: user.id } },
							},
						},
					},
					include: { members: true },
				});
			}

			// 💿 check if track exists

			let dbTrack = await prisma.track.findFirst({
				where: {
					OR: [{ id: track.id }, { spotifyId: track.spotifyId }],
				},
			});

			// 💿 if track doesn't exist, create new track

			if (!dbTrack) {
				dbTrack = await prisma.track.create({
					data: {
						name: track.name,
						spotifyId: track.spotifyId,
						released: track.released,
						imageUrl: track.imageUrl,
						team: { connect: { id: dbArtist.id } },
					},
				});
			}

			// 🚀 create campaign

			const newCampaign = await createPlaylistPitchCampaign({
				user,
				track: dbTrack,
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

			const campaign = await getCampaignById(campaignId, { requireTrack: true });

			if (!campaign)
				throw new TRPCError({ code: 'NOT_FOUND', message: 'Campaign not found' });
			if (!campaign.track)
				throw new TRPCError({ code: 'NOT_FOUND', message: 'Track not found' });

			const checkoutLink = await createPitchCheckoutLink({
				user: ctx.user,
				campaign,
			});

			return checkoutLink;
		}),

	// GET
	byId: publicProcedure.input(z.string()).query(async ({ input: campaignId }) => {
		console.log('fetching campaign', campaignId);
		const campaign = await getCampaignById(campaignId);
		if (!campaign) throw new TRPCError({ code: 'NOT_FOUND' });
		return campaign;
	}),
	byUser: privateProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(50).nullish(),
				cursor: z.date().nullish(),
				type: campaignTypeSchema.optional(),
				stage: campaignStageSchema.optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { type, stage } = input;

			const limit = input.limit ?? 20;
			const { cursor } = input;
			// find all campaigns that were a) created by the user or b) have a track that belongs to an artist that the user is a member of

			const campaigns = await prisma.campaign.findMany({
				take: limit + 1, // get an extra item at the end which we'll use as next cursor
				where: {
					OR: [
						{
							createdBy: {
								id: ctx.user.id,
							},
						},
						{
							track: {
								team: {
									members: {
										some: {
											userId: ctx.user.id,
										},
									},
								},
							},
						},
					],
					type,
					stage,
				},
				include: { _count: true, track: { include: { team: true } } },
				cursor: cursor ? { createdAt: cursor } : undefined,
				orderBy: { createdAt: 'desc' },
			});

			let nextCursor: typeof cursor | undefined = undefined;
			if (campaigns.length > limit) {
				const nextCampaign = campaigns.pop();
				nextCursor = nextCampaign?.createdAt;
			}

			return {
				campaigns,
				// totalCampaigns,
				nextCursor,
			};
		}),

	countByUser: privateProcedure
		.input(
			z.object({
				type: campaignTypeSchema.optional(),
				stage: campaignStageSchema.optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const { type, stage } = input;

			const totalCampaigns = await prisma.campaign.count({
				where: {
					OR: [
						{
							createdBy: {
								id: ctx.user.id,
							},
						},
						{
							track: {
								team: {
									members: {
										some: {
											userId: ctx.user.id,
										},
									},
								},
							},
						},
					],

					type,
					stage,
				},
			});

			return totalCampaigns;
		}),

	toScreen: privateProcedure.query(async ({ ctx }) => {
		if (!ctx.user.pitchScreening) throw new TRPCError({ code: 'UNAUTHORIZED' });

		const campaigns = await prisma.campaign.findMany({
			where: {
				stage: 'screening',
			},
			orderBy: { createdAt: 'asc' },
			include: {
				track: {
					include: {
						team: true,
						trackGenres: {
							select: {
								genre: {
									select: {
										_count: { select: { playlistGenres: true } },
										name: true,
									},
								},
							},
						},
					},
				},
			},
			take: 2,
		});
		return campaigns;
	}),

	// toReview: privateProcedure
	// 	.input(z.object({ genreNames: z.array(z.string()).optional() }))
	// 	.query(async ({ input, ctx }) => {
	// 		const campaignsToReview = await getCampaignsToReview({
	// 			userId: ctx.user.id,
	// 			genreNames: input.genreNames,
	// 		});
	// 		return campaignsToReview;
	// 	}),

	// UPDATE
	update: privateProcedure
		.input(campaignUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;

			const campaign = await prisma.campaign.update({
				where: { id },
				include: { track: { include: { team: true } }, createdBy: true },
				data,
			});

			await prisma.campaignUpdateRecord.create({
				data: {
					campaign: { connect: { id } },
					createdBy: { connect: { id: ctx.user.id } },
					stage: input.stage && campaign.stage,
				},
			});

			if (
				campaign.type === 'playlistPitch' &&
				input.stage === 'approved' &&
				campaign.createdBy &&
				campaign.track && campaign.screeningMessage
			) {
				// set the curator reach to the minimum if it's not set yet
				if (!campaign.curatorReach) {
					await prisma.campaign.update({
						where: { id },
						data: {
							curatorReach: 3,
						},
					});
				}

				// send email to the user that created the campaign

				const emailLoginLink = await createLoginLink({
					provider: 'email',
					identifier: campaign.createdBy.email,
					callbackUrl: `${env.NEXT_PUBLIC_APP_BASE_URL}/campaigns/${campaign.id}/launch`,
				});

				await sendEmail({
					from: 'adam@barely.io',
					to: campaign.createdBy.email,
					subject: `Your playlist.pitch campaign for ${campaign.track.name} is approved!`,
					template: PlaylistPitchApprovedEmailTemplate({
						firstName:
							campaign.createdBy.firstName ?? campaign.createdBy.username ?? undefined,
						trackName: campaign.track.name,
						loginLink: emailLoginLink,
						screeningMessage: campaign.screeningMessage,
					}),
					type: 'transactional',
				});

				// send text to the user that created the campaign

				if (campaign.createdBy.phone) {
					console.log('campaign.createdBy.phone', campaign.createdBy.phone)

					const phoneLoginLink = await createLoginLink({
						provider: 'phone',
						identifier: campaign.createdBy.phone,
						callbackUrl: `${env.NEXT_PUBLIC_APP_BASE_URL}/campaigns/${campaign.id}/launch`,
					});

					console.log('phoneLoginLink', phoneLoginLink)
				
					const text = await sendText({
						to: campaign.createdBy.phone,
						body: `Your playlist.pitch for ${campaign.track.name} has been approved! Click the link below to launch your campaign. ${phoneLoginLink}`,
					});

					console.log('text', text)
				}
			}

			await pusher.trigger('campaigns', `updated-${campaign.id}`, {
				pageSessionId: ctx.pageSessionId,
			});

			return campaign;
		}),
});

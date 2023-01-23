import { router, publicProcedure } from '../trpc';
import { createCampaignFormSchema } from '@barely/schema/forms';
import { ArtistUserRoleOption } from '@barely/db';
import { TRPCError } from '@trpc/server';

export const campaignRouter = router({
	create: publicProcedure
		.input(createCampaignFormSchema)
		.mutation(async ({ ctx, input }) => {
			console.log('The input is', input);
			const { type, user, artist, track } = input;

			// check if artist already exists in db
			let dbArtist = await ctx.prisma.artist.findUnique({
				where: artist.id ? { id: artist.id } : { spotifyId: artist.spotifyId },
				include: { userRoles: true },
			});

			// if artist exists, check if user has access. if not, throw error
			if (dbArtist) {
				const userHasAccess = dbArtist.userRoles.some(
					artistUserRole =>
						artistUserRole.userId === ctx.user?.id &&
						(artistUserRole.role === 'label' ||
							artistUserRole.role === 'manager' ||
							artistUserRole.role === 'artist'),
				);
				if (userHasAccess) return;
				if (!ctx.user?.id) {
					throw new TRPCError({
						code: 'UNAUTHORIZED',
						message:
							'That artist is already in our system, but you must be logged in to access it',
					});
				}
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message:
						'That artist is already in our system, but you do not have access to it',
				});
			}

			// 📍 one of 3 scenarios left now (?):
			// 1️⃣ artist exists, user exists, and user has access
			// 2️⃣ user exists, but artist doesn't exist
			// 3️⃣ neither artist or user exists

			// if user doesn't exist, neither does artist. create user and artist.
			let dbUserId = ctx.user?.id;
			if (!dbUserId) {
				const newUser = await ctx.prisma.user.create({
					data: {
						firstName: user.firstName,
						lastName: user.lastName,
						email: user.email,
						phone: user.phone,
					},
				});

				dbUserId = newUser.id;

				// create artist, connect user to artist, and add userRole to artist
				dbArtist = await ctx.prisma.artist.create({
					data: {
						name: artist.name,
						handle: artist.handle ?? artist.name.toLowerCase().replaceAll(' ', ''),
						spotifyId: artist.spotifyId,
						owner: { connect: { id: dbUserId } },
						userRoles: {
							create: {
								userId: dbUserId,
								role: ArtistUserRoleOption.artist,
							},
						},
					},
					include: { userRoles: true },
				});
			}

			// 📍 one of 2 scenarios left now (?):
			// 1️⃣ artist exists, user exists, and user has access
			// 2️⃣ user exists, but artist doesn't exist

			// if artist doesn't exist, create artist
			if (!dbArtist) {
				dbArtist = await ctx.prisma.artist.create({
					data: {
						name: artist.name,
						handle: artist.handle ?? artist.name.toLowerCase().replaceAll(' ', ''),
						spotifyId: artist.spotifyId,
						owner: { connect: { id: dbUserId } },
						userRoles: {
							create: {
								userId: dbUserId,
								role: ArtistUserRoleOption.artist,
							},
						},
					},
					include: { userRoles: true },
				});
			}

			// we should now have a user and an artist. create campaign. 👍
			const newCampaign = await ctx.prisma.campaign.create({
				data: {
					type,
					createdBy: { connect: { id: dbUserId } },
					stage: 'screening',
					artist: { connect: { id: artist.id } },
					track: track.id
						? { connect: { id: track.id } }
						: {
								create: {
									name: track.name,
									artist: { connect: { id: dbArtist.id } },
									released: track.released,
									releaseDate: track.releaseDate,
									spotifyId: track.spotifyId,
								},
						  },
				},
			});

			// todo - send email to artist
			//
		}),

	// return await ctx.prisma.campaign.create({
	// 	data: input,
	// });
});

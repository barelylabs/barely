import { TRPCError } from '@trpc/server';

import { prisma } from '@barely/db';

import { estimateGenresByPlaylistId } from '../playlist/playlist.node.fns';
import { getSpotifyAccessToken } from './spotify.edge.fns';
import { getSpotifyUserPlaylists } from './spotify.endpts.playlist';
import { getSpotifyUser } from './spotify.endpts.user';

const syncSpotifyAccountUser = async ({
	accountSpotifyId,
}: {
	accountSpotifyId: string;
}) => {
	console.log('syncing spotify user...');

	const spotifyAccount = await prisma.account.findUnique({
		where: {
			provider_providerAccountId: {
				provider: 'spotify',
				providerAccountId: accountSpotifyId,
			},
		},
	});

	if (!spotifyAccount) return console.error('No spotify account found with that id.');

	const accessToken = await getSpotifyAccessToken(spotifyAccount).catch(err => {
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: "We're having trouble with the Spotify API right now. Bear with us.",
			cause: err,
		});
	});

	// update spotify user info

	const spotifyUser = await getSpotifyUser({ accessToken });

	if (!spotifyUser) return;

	await prisma.account.update({
		where: {
			id: spotifyAccount.id,
		},
		data: {
			username: spotifyUser.display_name,
			email: spotifyUser.email,
			image: spotifyUser.images[0]?.url,
		},
	});

	return;
};

const syncSpotifyAccountPlaylists = async ({
	accountSpotifyId,
}: {
	accountSpotifyId: string;
}) => {
	console.log('syncing spotify playlists in the fn...');

	const spotifyAccount = await prisma.account.findUnique({
		where: {
			provider_providerAccountId: {
				provider: 'spotify',
				providerAccountId: accountSpotifyId,
			},
		},
		include: {
			user: true,
		},
	});

	if (!spotifyAccount?.providerAccountId)
		return console.error('No spotify account found with that id.');

	const accessToken = await getSpotifyAccessToken(spotifyAccount).catch(err => {
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: "We're having trouble with the Spotify API right now. Bear with us.",
			cause: err,
		});
	});

	// get spotify user playlists

	const userSpotifyPlaylists = await getSpotifyUserPlaylists({
		accessToken,
		userSpotifyId: spotifyAccount.providerAccountId,
	});

	if (!userSpotifyPlaylists) return;

	// sync user spotify playlists

	console.log('syncing spotify playlists...');

	for (const userSpotifyPlaylist of userSpotifyPlaylists) {
		const syncedPlaylist = await prisma.playlist.upsert({
			where: {
				spotifyId: userSpotifyPlaylist.id,
			},
			create: {
				spotifyId: userSpotifyPlaylist.id,
				spotifyAccount: {
					connect: {
						id: spotifyAccount.id,
					},
				},
				public: userSpotifyPlaylist.public,
				userOwned: userSpotifyPlaylist.owner.id === spotifyAccount.providerAccountId,
				name: userSpotifyPlaylist.name,
				description: userSpotifyPlaylist.description,
				imageUrl: userSpotifyPlaylist.images[0]?.url,
				totalTracks: userSpotifyPlaylist.tracks.total,
				forTesting: false,
			},
			update: {
				spotifyAccount: {
					connect: {
						id: spotifyAccount.id,
					},
				},
				name: userSpotifyPlaylist.name,
				public: userSpotifyPlaylist.public,
				description: userSpotifyPlaylist.description,
				imageUrl: userSpotifyPlaylist.images[0]?.url,
				totalTracks: userSpotifyPlaylist.tracks.total,
			},
			select: {
				id: true,
				playlistGenres: true,
				spotifyId: true,
				spotifyAccount: true,
			},
		});

		if (!syncedPlaylist?.playlistGenres || syncedPlaylist.playlistGenres.length === 0) {
			console.log('generating playlist genres for playlist...');

			const gptGenres = await estimateGenresByPlaylistId({
				playlistId: syncedPlaylist.id,
			});

			// await Promise.allSettled(
			// 	genres.map(async genre => {
			// 		await prisma.genre.upsert({
			// 			where: {
			// 				name: genre,
			// 			},
			// 			create: {
			// 				name: genre,
			// 				playlists: { connect: { id: syncedPlaylist.id } },
			// 			},
			// 			update: {
			// 				playlists: { connect: { id: syncedPlaylist.id } },
			// 			},
			// 		});
			// 	}),
			// );
			await Promise.allSettled(
				gptGenres.map(genreName =>
					// create an entry in the playlistGenre table for each genre if it doesn't exist already
					prisma.playlistGenre.upsert({
						where: {
							playlistId_genreName: {
								playlistId: syncedPlaylist.id,
								genreName,
							},
						},

						update: {
							genre: {
								connectOrCreate: {
									where: {
										name: genreName,
									},
									create: {
										name: genreName,
									},
								},
							},
							playlist: {
								connect: {
									id: syncedPlaylist.id,
								},
							},
						},

						create: {
							genre: {
								connectOrCreate: {
									where: {
										name: genreName,
									},
									create: {
										name: genreName,
									},
								},
							},
							playlist: {
								connect: {
									id: syncedPlaylist.id,
								},
							},
						},
					}),
				),
			);
		}
	}

	return;
};

export { syncSpotifyAccountUser, syncSpotifyAccountPlaylists, getSpotifyAccessToken };

// import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { prisma } from '@barely/db';

// import env from '../../env';
// import { searchSpotify } from '../../spotify/api/search';
import { privateProcedure, publicProcedure, router } from '../trpc';
import {
	// getSpotifyAccessToken,
	syncSpotifyAccountPlaylists,
	syncSpotifyAccountUser,
} from './spotify.node.fns';

const spotifyRouter = router({
	syncSpotifyPlaylistsByAccountSpotifyId: publicProcedure
		.meta({
			openapi: { method: 'POST', path: `/spotify/sync-playlists/{accountSpotifyId}` },
		})
		.input(z.object({ accountSpotifyId: z.string() }))
		.output(z.boolean())
		.mutation(async ({ input }) => {
			console.log('syncing spotify playlists from open endpoint', input.accountSpotifyId);
			await syncSpotifyAccountPlaylists({ accountSpotifyId: input.accountSpotifyId });
			return true;
		}),

	syncCurrentUser: privateProcedure.mutation(async ({ ctx }) => {
		const spotifyAccounts = await prisma.account.findMany({
			where: {
				user: { id: ctx.user.id },
				provider: 'spotify',
			},
		});

		for (const spotifyAccount of spotifyAccounts) {
			if (!spotifyAccount.providerAccountId) continue;
			await syncSpotifyAccountUser({
				accountSpotifyId: spotifyAccount.providerAccountId,
			});
		}

		return true;
	}),

	// findTrack: publicProcedure.input(z.string()).query(async ({ input }) => {
	// 	const botSpotifyAccount = await prisma.account.findUnique({
	// 		where: {
	// 			provider_providerAccountId: {
	// 				provider: 'spotify',
	// 				providerAccountId: env.BOT_SPOTIFY_ACCOUNT_ID,
	// 			},
	// 		},
	// 	});

	// 	if (!botSpotifyAccount) {
	// 		throw new TRPCError({
	// 			code: 'INTERNAL_SERVER_ERROR',
	// 			message:
	// 				"No bot Spotify account found. We're having trouble with the Spotify API right now. Bear with us.",
	// 			cause: 'No bot Spotify account found.',
	// 		});
	// 	}

	// 	const accessToken = await getSpotifyAccessToken({
	// 		spotifyAccount: botSpotifyAccount,
	// 	});

	// 	if (!accessToken) {
	// 		throw new TRPCError({
	// 			code: 'INTERNAL_SERVER_ERROR',
	// 			message: "We're having trouble with the Spotify API right now. Bear with us.",
	// 			cause: 'No Spotify access token found for bot.',
	// 		});
	// 	}

	// 	const searchResults = await searchSpotify({
	// 		accessToken,
	// 		query: input,
	// 		types: ['track'],
	// 	});

	// 	const tracks = searchResults.tracks?.items ?? [];

	// 	tracks.map(track => {
	// 		track.album.images = track.album.images.filter(
	// 			image => image.width === 300 || image.width === 640,
	// 		);
	// 	});

	// 	return tracks;
	// }),
});

export { spotifyRouter };

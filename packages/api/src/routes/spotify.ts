import { router, publicProcedure, privateProcedure } from '../trpc';
import { z } from 'zod';

import spotify from '@barely/spotify';
// import { updateAccessToken } from '@barely/auth';
import { TRPCError } from '@trpc/server';

export const spotifyRouter = router({
	findTrack: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
		// todo - get spotify accessToken from clerk.dev and request auth token
		const accessToken = '';
		// if (!account?.refresh_token)
		// 	throw new TRPCError({
		// 		code: 'INTERNAL_SERVER_ERROR',
		// 		message: "We're having trouble with the Spotify API right now. Bear with us.",
		// 		cause: 'No Spotify account found for user.',
		// 	});

		// if (!account.expires_at || account.expires_at < Date.now() / 1000) {
		// 	console.log('we need to refresh the access token!');

		// 	const refreshRes = await spotify.auth.refreshAccessToken(account.refresh_token);

		// 	console.log('refreshRes.access_token => ', refreshRes.access_token);
		// 	console.log('refreshRes.expires_at => ', refreshRes.expires_at);

		// 	account = {
		// 		...account,
		// 		access_token: refreshRes.access_token,
		// 		expires_at: refreshRes.expires_at,
		// 	};

		// 	await updateAccessToken({
		// 		accountId: account.id,
		// 		access_token: refreshRes.access_token,
		// 		expires_at: refreshRes.expires_at,
		// 	});
		// }

		const searchResults = await spotify.search({
			accessToken,
			query: input,
			types: ['track'],
		});

		const tracks = searchResults.json?.tracks?.items ?? [];
		return tracks;
	}),
});

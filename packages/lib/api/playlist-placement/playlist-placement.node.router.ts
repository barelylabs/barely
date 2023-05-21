// import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { prisma } from '@barely/db';

import { getSpotifyAccessToken } from '../spotify/spotify.edge.fns';
import {
	addTrackToSpotifyPlaylist,
	getSpotifyPlaylistTrackIds,
	removeTrackFromSpotifyPlaylist,
} from '../spotify/spotify.endpts.playlist';
import { publicProcedure, router } from '../trpc';

const playlistPlacementRouter = router({
	checkPlacementQueue: publicProcedure
		.meta({
			openapi: { method: 'GET', path: `/playlist-placement/check-queue` },
		})
		.input(z.object({}))
		.output(z.boolean())
		.mutation(async () => {
			const queuedPlacements = await prisma.playlistPlacement.findMany({
				where: {
					addDate: { lt: new Date() },
					addedToPlaylist: false,
				},
			});

			for (const queuedPlacement of queuedPlacements) {
				console.log('queuedPlacement => ', queuedPlacement);
				if (queuedPlacement.playlistPosition === null) continue;

				const track = await prisma.track.findUnique({
					where: { id: queuedPlacement.trackId },
				});

				console.log('queuedTrack => ', track?.name || 'no track found');
				if (!track?.spotifyId) continue;

				const playlist = await prisma.playlist.findUnique({
					where: { id: queuedPlacement.playlistId },
				});

				console.log('queuedPlaylist => ', playlist || 'no playlist found');
				if (!playlist?.spotifyAccountId || !playlist.spotifyId) continue;

				const spotifyAccount = await prisma.account.findUnique({
					where: { id: playlist.spotifyAccountId },
				});

				console.log(
					'queuedSpotifyAccount => ',
					spotifyAccount?.providerAccountId || 'no spotify account found',
				);
				if (!spotifyAccount) continue;

				const spotifyAccessToken = await getSpotifyAccessToken(spotifyAccount);
				console.log(
					'spotifyAccessToken => ',
					spotifyAccessToken || 'no spotify access token found',
				);

				// check if the track is already in the playlist
				// const spotifyTracklist = await getSpotifyPlaylistTrackIds({
				// 	spotifyId: playlist.spotifyId,
				// 	accessToken: spotifyAccessToken,
				// });

				// const trackInstancesInPlaylist = spotifyTracklist.filter(
				// 	spotifyId => spotifyId === track.spotifyId,
				// );

				// console.log(
				// 	'playlist link => ',
				// 	`https://open.spotify.com/playlist/${playlist.spotifyId}`,
				// );
				// console.log(
				// 	'trackInstancesInPlaylist.length => ',
				// 	trackInstancesInPlaylist.length,
				// );
				// const trackIndex = spotifyTracklist.indexOf(track.spotifyId);
				// const distanceFromPlacement = Math.abs(
				// 	trackIndex - queuedPlacement.playlistPosition,
				// );

				// if (trackInstancesInPlaylist.length === 1 && distanceFromPlacement < 10) {
				// 	await prisma.playlistPlacement.update({
				// 		where: { id: queuedPlacement.id },
				// 		data: { addedToPlaylist: true },
				// 	});
				// 	continue;
				// }

				// if (trackInstancesInPlaylist.length > 0) {
					// -> the track is either already in the playlist multiple times or in there too far from the placement position
				console.log('removing track from playlist...')	
				await removeTrackFromSpotifyPlaylist({
						accessToken: spotifyAccessToken,
						trackSpotifyId: track.spotifyId,
						playlistSpotifyId: playlist.spotifyId,
					});
				// }

				// if it is not in the playlist, add it to the playlist
				console.log('adding track to playlist...');
				console.log('track.spotifyId => ', track.spotifyId);
				console.log('playlist.spotifyId => ', playlist.spotifyId);
				console.log(
					'playlist link => ',
					`https://open.spotify.com/playlist/${playlist.spotifyId}`,
				);

				await addTrackToSpotifyPlaylist({
					accessToken: spotifyAccessToken,
					trackSpotifyId: track.spotifyId,
					playlistSpotifyId: playlist.spotifyId,
					position: queuedPlacement.playlistPosition,
				});

				// -> update the placement to addedToPlaylist: true
				// todo - uncomment this
				// await prisma.playlistPlacement.update({
				// 	where: { id: queuedPlacement.id },
				// 	data: { addedToPlaylist: true },
				// });
			}

			return true;
		}),
});

export { playlistPlacementRouter };

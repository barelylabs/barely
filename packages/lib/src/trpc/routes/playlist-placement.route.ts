import type { TRPCRouterRecord } from '@trpc/server';
// import { TRPCError } from '@trpc/server';

import { dbHttp } from '@barely/db/client';
import { PlaylistPlacements } from '@barely/db/sql';
import { and, eq, lt } from 'drizzle-orm';
import { z } from 'zod/v4';

import { getSpotifyAccessToken } from '../../functions/spotify.fns';
import {
	addTrackToSpotifyPlaylist,
	removeTrackFromSpotifyPlaylist,
} from '../../integrations/spotify/spotify.endpts.playlist';
import { publicProcedure } from '../trpc';

export const playlistPlacementRoute = {
	checkPlacementQueue: publicProcedure
		.meta({
			openapi: { method: 'GET', path: `/playlist-placement/check-queue` },
		})
		.input(z.object({}))
		.output(z.boolean())
		.mutation(async () => {
			const queuedPlacements = await dbHttp.query.PlaylistPlacements.findMany({
				where: and(
					lt(PlaylistPlacements.addDate, new Date().toISOString()),
					eq(PlaylistPlacements.addedToPlaylist, false),
				),
				with: {
					track: true,
					playlist: {
						with: {
							_providerAccounts: {
								with: {
									providerAccount: true,
								},
							},
						},
					},
				},
			});

			for (const queuedPlacement of queuedPlacements) {
				console.log('queuedPlacement => ', queuedPlacement);
				// if (queuedPlacement.playlistPosition === null) continue;

				const track = queuedPlacement.track;

				console.log('queuedTrack => ', track.name || 'no track found');
				if (!track.spotifyId) continue;

				const playlist = queuedPlacement.playlist;

				console.log('queuedPlaylist => ', playlist);
				if (!playlist.spotifyId || !playlist.spotifyId) continue;

				const spotifyAccount = playlist._providerAccounts.find(
					_pa => _pa.providerAccount.provider === 'spotify',
				)?.providerAccount;

				console.log(
					'queuedSpotifyAccount => ',
					spotifyAccount?.providerAccountId ?? 'no spotify account found',
				);
				if (!spotifyAccount) continue;

				const spotifyAccessToken = await getSpotifyAccessToken(spotifyAccount);
				console.log(
					'spotifyAccessToken => ',
					spotifyAccessToken || 'no spotify access token found',
				);

				// if (trackInstancesInPlaylist.length > 0) {
				// -> the track is either already in the playlist multiple times or in there too far from the placement position
				console.log('removing track from playlist...');
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
} satisfies TRPCRouterRecord;

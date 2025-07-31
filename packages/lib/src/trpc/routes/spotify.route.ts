import type { TrackWith_Workspace_Genres_Files } from '@barely/validators';
import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { ProviderAccounts } from '@barely/db/sql';
import { _Albums_To_Tracks, Albums } from '@barely/db/sql/album.sql';
import { Tracks } from '@barely/db/sql/track.sql';
import { ingestStreamingStat } from '@barely/tb/ingest';
import { newId, parseSpotifyUrl } from '@barely/utils';
import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import * as r from 'remeda';
import { z } from 'zod/v4';

import { libEnv } from '../../../env';
import {
	getSpotifyAccessToken,
	syncSpotifyAccountPlaylists,
	syncSpotifyAccountUser,
	syncSpotifyTrack,
} from '../../functions/spotify.fns';
import { getSpotifyAlbum } from '../../integrations/spotify/spotify.endpts.album';
import {
	getSpotifyArtist,
	getSpotifyArtistAlbums,
} from '../../integrations/spotify/spotify.endpts.artist';
import { getSpotifyPlaylist } from '../../integrations/spotify/spotify.endpts.playlist';
import { searchSpotify } from '../../integrations/spotify/spotify.endpts.search';
import {
	getSpotifyTrack,
	getSpotifyTracksByAlbum,
} from '../../integrations/spotify/spotify.endpts.track';
import { ratelimit } from '../../integrations/upstash';
import { privateProcedure, publicProcedure, workspaceProcedure } from '../trpc';

interface SpotifyTrackOptionArtist
	extends Pick<TrackWith_Workspace_Genres_Files['workspace'], 'name'> {
	id?: string;
	handle?: string;
	spotifyArtistId: string;
}

export type SpotifyTrackOption = Pick<
	TrackWith_Workspace_Genres_Files,
	'id' | 'name' | 'isrc' | 'spotifyId' | 'released' | 'imageUrl'
> & {
	workspace: SpotifyTrackOptionArtist;
};

export const spotifyRoute = {
	getMetadata: publicProcedure
		.input(
			z.object({
				query: z.string(),
			}),
		)
		.query(async ({ input }) => {
			const parsedItem = parseSpotifyUrl(input.query);
			console.log('parsedItem => ', parsedItem);
			if (!parsedItem) return null;
			const { type, id } = parsedItem;

			console.log('type => ', type);
			console.log('id => ', id);

			if (!type || !id) return null;

			const botSpotifyAccount = await dbHttp.query.ProviderAccounts.findFirst({
				where: and(
					eq(ProviderAccounts.provider, 'spotify'),
					eq(ProviderAccounts.providerAccountId, libEnv.BOT_SPOTIFY_ACCOUNT_ID),
				),
			});

			if (!botSpotifyAccount) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: "We're having trouble with the Spotify API right now. Bear with us.",
					cause: 'No bot Spotify account found.',
				});
			}

			const accessToken = await getSpotifyAccessToken(botSpotifyAccount);

			if (!accessToken) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: "We're having trouble with the Spotify API right now. Bear with us.",
					cause: 'No Spotify access token found for bot.',
				});
			}

			if (type === 'playlist') {
				const playlist = await getSpotifyPlaylist({
					accessToken,
					spotifyId: id,
				});

				console.log('playlist => ', playlist);

				return {
					title: playlist?.name,
					imageUrl: playlist?.images[0]?.url ?? null,
				};
			} else if (type === 'track') {
				const track = await getSpotifyTrack({
					accessToken,
					spotifyId: id,
				});

				console.log('track => ', track);

				return {
					title: track?.name,
					imageUrl: track?.album.images[0]?.url ?? null,
				};
			} else if (type === 'album') {
				const album = await getSpotifyAlbum({
					accessToken,
					spotifyId: id,
				});

				console.log('album => ', album);

				return {
					title: album?.name,
					imageUrl: album?.images[0]?.url ?? null,
				};
			} else if (type === 'artist') {
				const artist = await getSpotifyArtist({
					accessToken,
					spotifyId: id,
				});

				console.log('artist => ', artist);

				return {
					title: artist?.name,
					imageUrl: artist?.images[0]?.url ?? null,
				};
			}

			return null;
		}),

	getArtist: publicProcedure
		.input(
			z.object({
				spotifyId: z.string(),
			}),
		)
		.query(async ({ input }) => {
			const botSpotifyAccount = await dbHttp.query.ProviderAccounts.findFirst({
				where: and(
					eq(ProviderAccounts.provider, 'spotify'),
					eq(ProviderAccounts.providerAccountId, libEnv.BOT_SPOTIFY_ACCOUNT_ID),
				),
			});

			if (!botSpotifyAccount) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: "We're having trouble with the Spotify API right now. Bear with us.",
					cause: 'No bot Spotify account found.',
				});
			}

			const accessToken = await getSpotifyAccessToken(botSpotifyAccount);

			if (!accessToken) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: "We're having trouble with the Spotify API right now. Bear with us.",
					cause: 'No Spotify access token found for bot.',
				});
			}

			const artist = await getSpotifyArtist({
				accessToken,
				spotifyId: input.spotifyId,
			});

			return artist;
		}),

	// getAppleMusic: publicProcedure
	// 	.input(z.string().url())
	// 	.query(async ({ ctx, input }) => {
	// 		const botSpotifyAccount = await dbHttp.query.ProviderAccounts.findFirst({
	// 			where: and(
	// 				eq(ProviderAccounts.provider, 'spotify'),
	// 				eq(ProviderAccounts.providerAccountId, env.BOT_SPOTIFY_ACCOUNT_ID),
	// 			),
	// 		});

	// 		if (!botSpotifyAccount) {
	// 			throw new TRPCError({
	// 				code: 'INTERNAL_SERVER_ERROR',
	// 				message: "We're having trouble with the Spotify API right now. Bear with us.",
	// 				cause: 'No bot Spotify account found.',
	// 			});
	// 		}

	// 		const accessToken = await getSpotifyAccessToken(botSpotifyAccount);

	// 		if (!accessToken) {
	// 			throw new TRPCError({
	// 				code: 'INTERNAL_SERVER_ERROR',
	// 				message: "We're having trouble with the Spotify API right now. Bear with us.",
	// 				cause: 'No Spotify access token found for bot.',
	// 			});
	// 		}

	// 		// Extract Spotify track ID from the input URL
	// 		const parsed = parseSpotifyUrl(input);

	// 		if (!parsed || parsed.type !== 'track' || !parsed.id) {
	// 			throw new TRPCError({
	// 				code: 'BAD_REQUEST',
	// 				message: 'Invalid Spotify track URL',
	// 			});
	// 		}

	// 		// Get track details from Spotify
	// 		const track = await getSpotifyTrack({
	// 			accessToken,
	// 			spotifyId: parsed.id,
	// 		});

	// 		if (!track) {
	// 			throw new TRPCError({
	// 				code: 'NOT_FOUND',
	// 				message: 'Spotify track not found',
	// 			});
	// 		}

	// 		// Search for the track on Apple Music
	// 		const searchQuery = `${track.name} ${track.artists[0].name}`;
	// 		const appleMusicResults = await searchAppleMusic(searchQuery);

	// 		if (!appleMusicResults || appleMusicResults.length === 0) {
	// 			return null; // No matching track found on Apple Music
	// 		}

	// 		// Return the URL of the first matching track on Apple Music
	// 		return appleMusicResults[0].url;
	// 	}),

	search: publicProcedure
		.input(
			z.object({
				query: z.string(),
				limit: z.number().optional(),
			}),
		)
		.query(async ({ input }) => {
			const botSpotifyAccount = await dbHttp.query.ProviderAccounts.findFirst({
				where: and(
					eq(ProviderAccounts.provider, 'spotify'),
					eq(ProviderAccounts.providerAccountId, libEnv.BOT_SPOTIFY_ACCOUNT_ID),
				),
			});

			if (!botSpotifyAccount) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: "We're having trouble with the Spotify API right now. Bear with us.",
					cause: 'No bot Spotify account found.',
				});
			}

			const accessToken = await getSpotifyAccessToken(botSpotifyAccount);

			if (!accessToken) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: "We're having trouble with the Spotify API right now. Bear with us.",
					cause: 'No Spotify access token found for bot.',
				});
			}

			const searchResults = await searchSpotify({
				accessToken,
				query: input.query,
				limit: input.limit,
			});

			return searchResults;
		}),

	findTrack: publicProcedure.input(z.string()).query(async ({ input }) => {
		if (input.length === 0) return [];

		const botSpotifyAccount = await dbHttp.query.ProviderAccounts.findFirst({
			where: and(
				eq(ProviderAccounts.provider, 'spotify'),
				eq(ProviderAccounts.providerAccountId, libEnv.BOT_SPOTIFY_ACCOUNT_ID),
			),
		});

		if (!botSpotifyAccount) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: "We're having trouble with the Spotify API right now. Bear with us.",
				cause: 'No bot Spotify account found.',
			});
		}

		const accessToken = await getSpotifyAccessToken(botSpotifyAccount);

		if (!accessToken) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: "We're having trouble with the Spotify API right now. Bear with us.",
				cause: 'No Spotify access token found for bot.',
			});
		}

		const searchResults = await searchSpotify({
			accessToken,
			query: input,
			types: ['track'],
		});

		const trackResults = searchResults.tracks?.items ?? [];

		const tracks = trackResults.map(t => {
			const track: SpotifyTrackOption = {
				id: 'spotify.' + t.id,
				name: t.name,
				spotifyId: t.id,
				isrc: t.external_ids.isrc,
				released: true,
				imageUrl:
					t.album.images.find(image => image.width === 300 || image.width === 640)?.url ??
					null,
				workspace: {
					name: t.artists[0]?.name ?? 'Unknown Artist',
					spotifyArtistId: t.artists[0]?.id ?? 'unknown',
				},
			};

			return track;
		});

		// console.log('tracks => ', tracks);

		const uniqueTracks = r.uniqBy(tracks, t => t.spotifyId);

		// console.log('uniqueTracks => ', uniqueTracks);
		return uniqueTracks;
	}),

	findArtist: publicProcedure
		.input(
			z.object({
				query: z.string(),
			}),
		)
		.query(async ({ input }) => {
			const botSpotifyAccount = await dbHttp.query.ProviderAccounts.findFirst({
				where: and(
					eq(ProviderAccounts.provider, 'spotify'),
					eq(ProviderAccounts.providerAccountId, libEnv.BOT_SPOTIFY_ACCOUNT_ID),
				),
			});

			if (!botSpotifyAccount) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: "We're having trouble with the Spotify API right now. Bear with us.",
					cause: 'No bot Spotify account found.',
				});
			}

			const accessToken = await getSpotifyAccessToken(botSpotifyAccount);

			if (!accessToken) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: "We're having trouble with the Spotify API right now. Bear with us.",
					cause: 'No Spotify access token found for bot.',
				});
			}

			const searchResults = await searchSpotify({
				accessToken,
				query: input.query,
				types: ['artist'],
			});

			return searchResults.artists?.items ?? [];
		}),

	syncWorkspaceArtist: workspaceProcedure.mutation(async ({ ctx }) => {
		// Rate limit to once per minute
		const limiter = ratelimit(1, '600 s');
		const { success } = await limiter.limit(
			ctx.workspace.id + 'syncWorkspaceSpotifyArtist',
		);

		if (!success) {
			throw new Error('Rate limit exceeded. Please try again in a few minutes.');
		}

		if (!ctx.workspace.spotifyArtistId) {
			throw new Error('No Spotify artist ID found for this workspace.');
		}

		// Fetch albums from Spotify
		const botSpotifyAccount = await dbHttp.query.ProviderAccounts.findFirst({
			where: and(
				eq(ProviderAccounts.provider, 'spotify'),
				eq(ProviderAccounts.providerAccountId, libEnv.BOT_SPOTIFY_ACCOUNT_ID),
			),
		});

		if (!botSpotifyAccount) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: "We're having trouble with the Spotify API right now. Bear with us.",
				cause: 'No bot Spotify account found.',
			});
		}

		const accessToken = await getSpotifyAccessToken(botSpotifyAccount);

		const albums = await getSpotifyArtistAlbums({
			accessToken,
			spotifyId: ctx.workspace.spotifyArtistId,
			needPopularity: true,
		});

		// throw new Error('test');

		if (!albums?.items) {
			throw new Error('Failed to fetch artist albums');
		}

		// Process each album
		for (const album of albums.items) {
			console.log('syncing album => ', album.name);
			// Check if album exists
			const existingAlbum = await dbHttp.query.Albums.findFirst({
				where: eq(Albums.spotifyId, album.id),
			});

			if (existingAlbum) {
				// Update existing album
				await dbHttp
					.update(Albums)
					.set({
						name: album.name,
						imageUrl: album.images[0]?.url,
						releaseDate: album.release_date,
						totalTracks: album.total_tracks,
					})
					.where(eq(Albums.id, existingAlbum.id))
					.returning();

				// Fetch tracks for this album
				const tracks = await getSpotifyTracksByAlbum({
					accessToken,
					albumId: album.id,
				});

				if (!tracks?.items) continue;

				// Process each track
				for (const track of tracks.items) {
					await syncSpotifyTrack({
						spotifyTrack: track,
						albumId: existingAlbum.id,
						workspaceId: ctx.workspace.id,
						pool: ctx.pool,
					});
				}
			} else {
				// Create new album
				const [newAlbum] = await dbHttp
					.insert(Albums)
					.values({
						id: newId('album'),
						workspaceId: ctx.workspace.id,
						name: album.name,
						imageUrl: album.images[0]?.url,
						releaseDate: album.release_date,
						totalTracks: album.total_tracks,
						spotifyId: album.id,
					})
					.returning();

				if (!newAlbum) continue;

				// Fetch tracks for this album
				const tracks = await getSpotifyTracksByAlbum({
					accessToken,
					albumId: album.id,
				});

				if (!tracks?.items) continue;

				// Process each track
				for (const track of tracks.items) {
					await syncSpotifyTrack({
						spotifyTrack: track,
						albumId: newAlbum.id,
						workspaceId: ctx.workspace.id,
						pool: ctx.pool,
					});
				}
			}
		}

		// Fetch artist stats and ingest to Tinybird
		const artist = await getSpotifyArtist({
			accessToken,
			spotifyId: ctx.workspace.spotifyArtistId,
		});

		if (artist) {
			const timestamp = new Date().toISOString();
			const events = [];

			// Add artist stats
			events.push({
				timestamp,
				workspaceId: ctx.workspace.id,
				type: 'artist' as const,
				spotifyId: artist.id,
				spotifyFollowers: artist.followers.total,
				spotifyPopularity: artist.popularity,
			});

			// Add album stats
			for (const album of albums.items) {
				if (album.popularity !== undefined && album.popularity !== null) {
					events.push({
						timestamp,
						workspaceId: ctx.workspace.id,
						type: 'album' as const,
						spotifyId: album.id,
						spotifyPopularity: album.popularity,
					});
				}
			}

			// Get all tracks that were synced to add their popularity
			const allTracks = await dbHttp.query.Tracks.findMany({
				where: eq(Tracks.workspaceId, ctx.workspace.id),
				columns: {
					spotifyId: true,
					spotifyPopularity: true,
				},
			});

			// Add track stats
			for (const track of allTracks) {
				if (track.spotifyId && track.spotifyPopularity !== null) {
					events.push({
						timestamp,
						workspaceId: ctx.workspace.id,
						type: 'track' as const,
						spotifyId: track.spotifyId,
						spotifyPopularity: track.spotifyPopularity,
					});
				}
			}

			// Ingest all events to Tinybird
			if (events.length > 0) {
				await ingestStreamingStat(events);
			}
		}

		return { success: true };
	}),

	syncSpotifyAccount: privateProcedure
		.input(z.string())
		.mutation(async ({ input, ctx }) => {
			await syncSpotifyAccountUser(input, ctx.pool);
			await syncSpotifyAccountPlaylists(input, ctx.pool);
			return true;
		}),

	syncCurrentUser: privateProcedure.mutation(async ({ ctx }) => {
		const spotifyAccounts = await dbHttp.query.ProviderAccounts.findMany({
			where: and(
				eq(ProviderAccounts.provider, 'spotify'),
				eq(ProviderAccounts.userId, ctx.user.id),
			),
		});

		for (const spotifyAccount of spotifyAccounts) {
			if (!spotifyAccount.providerAccountId) continue;
			await syncSpotifyAccountUser(spotifyAccount.providerAccountId, ctx.pool);
		}

		return true;
	}),

	syncSpotifyPlaylistsByAccountSpotifyId: publicProcedure
		.meta({
			openapi: {
				method: 'POST',
				path: `/spotify/sync-playlists/{accountSpotifyId}`,
			},
		})
		.input(z.object({ accountSpotifyId: z.string() }))
		.output(z.boolean())
		.mutation(async ({ input, ctx }) => {
			console.log('syncing spotify playlists from open endpoint', input.accountSpotifyId);
			await syncSpotifyAccountPlaylists(input.accountSpotifyId, ctx.pool);
			return true;
		}),
} satisfies TRPCRouterRecord;

import type { TrackWith_Workspace_Genres_Files } from '@barely/validators';
import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { ProviderAccounts } from '@barely/db/sql';
import { _Albums_To_Tracks, Albums } from '@barely/db/sql/album.sql';
import { Tracks } from '@barely/db/sql/track.sql';
import { ingestStreamingStat } from '@barely/tb/ingest';
import { isValidSpotifyId, newId, parseSpotifyUrl } from '@barely/utils';
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

// Rate limiting constants
const RATE_LIMITS = {
	SEARCH: { requests: 10, window: '1 m' },
	FIND_TRACK: { requests: 20, window: '1 m' },
	SYNC_ARTIST: { requests: 1, window: '1 h' },
} as const;

// Spotify API constants
const SPOTIFY_LIMITS = {
	ALBUMS_PER_REQUEST: 50,
	ALBUM_BATCH_SIZE: 10,
} as const;

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
	/**
	 * Get metadata for a Spotify URL (track, album, artist, or playlist)
	 * Validates the Spotify ID before making API calls
	 * @returns metadata object with title and imageUrl, or null if invalid
	 */
	getMetadata: publicProcedure
		.input(
			z.object({
				query: z.string(),
			}),
		)
		.query(async ({ input }) => {
			const parsedItem = parseSpotifyUrl(input.query);
			if (!parsedItem) return null;
			const { type, id } = parsedItem;

			if (!type || !id || !isValidSpotifyId(id)) return null;

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

				return {
					title: playlist?.name,
					imageUrl: playlist?.images[0]?.url ?? null,
				};
			} else if (type === 'track') {
				const track = await getSpotifyTrack({
					accessToken,
					spotifyId: id,
				});

				return {
					title: track?.name,
					imageUrl: track?.album.images[0]?.url ?? null,
				};
			} else if (type === 'album') {
				const album = await getSpotifyAlbum({
					accessToken,
					spotifyId: id,
				});

				return {
					title: album?.name,
					imageUrl: album?.images[0]?.url ?? null,
				};
			} else if (type === 'artist') {
				const artist = await getSpotifyArtist({
					accessToken,
					spotifyId: id,
				});

				return {
					title: artist?.name,
					imageUrl: artist?.images[0]?.url ?? null,
				};
			}

			return null;
		}),

	/**
	 * Get artist details from Spotify API
	 * Validates Spotify ID format before making request
	 * @throws TRPCError with BAD_REQUEST if invalid ID
	 */
	getArtist: publicProcedure
		.input(
			z.object({
				spotifyId: z.string(),
			}),
		)
		.query(async ({ input }) => {
			if (!isValidSpotifyId(input.spotifyId)) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Invalid Spotify ID',
				});
			}

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

	/**
	 * Search Spotify for tracks, artists, albums, or playlists
	 * Rate limited to prevent abuse
	 */
	search: publicProcedure
		.input(
			z.object({
				query: z.string(),
				limit: z.number().optional(),
			}),
		)
		.query(async ({ input, ctx }) => {
			// Rate limit: 10 requests per minute per session/anonymous user
			const limiter = ratelimit(RATE_LIMITS.SEARCH.requests, RATE_LIMITS.SEARCH.window);
			const identifier = ctx.pageSessionId ?? ctx.session?.user.id ?? 'anonymous';
			const { success } = await limiter.limit(`search:${identifier}`);

			if (!success) {
				throw new TRPCError({
					code: 'TOO_MANY_REQUESTS',
					message: 'Too many search requests. Please try again in a minute.',
				});
			}
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

	/**
	 * Find tracks on Spotify by search query
	 * Returns array of track options with artist info
	 * Rate limited to 20 requests per minute
	 */
	findTrack: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
		if (input.length === 0) return [];

		// Rate limit: 20 requests per minute per session/anonymous user
		const limiter = ratelimit(
			RATE_LIMITS.FIND_TRACK.requests,
			RATE_LIMITS.FIND_TRACK.window,
		);
		const identifier = ctx.pageSessionId ?? ctx.session?.user.id ?? 'anonymous';
		const { success } = await limiter.limit(`findTrack:${identifier}`);

		if (!success) {
			throw new TRPCError({
				code: 'TOO_MANY_REQUESTS',
				message: 'Too many search requests. Please try again in a minute.',
			});
		}

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

		const uniqueTracks = r.uniqBy(tracks, t => t.spotifyId);

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

	/**
	 * Sync all albums and tracks for a workspace's Spotify artist
	 * Processes albums in batches to avoid memory issues
	 * Rate limited to once per 10 minutes per workspace
	 * @throws Error if invalid Spotify artist ID or sync fails
	 */
	syncWorkspaceArtist: workspaceProcedure.mutation(async ({ ctx }) => {
		// Rate limit: 1 request per 10 minutes per workspace
		const limiter = ratelimit(
			RATE_LIMITS.SYNC_ARTIST.requests,
			RATE_LIMITS.SYNC_ARTIST.window,
		);
		const identifier = `workspace:${ctx.workspace.id}:syncSpotifyArtist`;
		const { success, reset } = await limiter.limit(identifier);

		if (!success) {
			const minutesUntilReset = Math.ceil((reset - Date.now()) / 1000 / 60);
			throw new TRPCError({
				code: 'TOO_MANY_REQUESTS',
				message: `Rate limit exceeded. You can sync again in ${minutesUntilReset} minutes.`,
			});
		}

		if (!ctx.workspace.spotifyArtistId) {
			throw new Error('No Spotify artist ID found for this workspace.');
		}

		if (!isValidSpotifyId(ctx.workspace.spotifyArtistId)) {
			throw new Error('Invalid Spotify artist ID for this workspace.');
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

		// Fetch albums with a reasonable limit to avoid overwhelming the API
		const albums = await getSpotifyArtistAlbums({
			accessToken,
			spotifyId: ctx.workspace.spotifyArtistId,
			needPopularity: true,
			limit: SPOTIFY_LIMITS.ALBUMS_PER_REQUEST,
		});

		if (!albums?.items) {
			throw new Error('Failed to fetch artist albums');
		}

		// Process albums in batches to avoid memory issues
		const BATCH_SIZE = SPOTIFY_LIMITS.ALBUM_BATCH_SIZE;
		for (let i = 0; i < albums.items.length; i += BATCH_SIZE) {
			const albumBatch = albums.items.slice(i, i + BATCH_SIZE);

			// Process each album in the batch
			for (const album of albumBatch) {
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
			await syncSpotifyAccountPlaylists(input.accountSpotifyId, ctx.pool);
			return true;
		}),
} satisfies TRPCRouterRecord;

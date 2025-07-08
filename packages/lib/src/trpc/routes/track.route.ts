import type { TRPCRouterRecord } from '@trpc/server';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import {
	_Files_To_Tracks__Artwork,
	_Files_To_Tracks__Audio,
} from '@barely/db/sql/file.sql';
import { _Tracks_To_Genres } from '@barely/db/sql/genre.sql';
import { Tracks } from '@barely/db/sql/track.sql';
import { sqlAnd } from '@barely/db/utils';
import {
	createTrackSchema,
	insertGenreSchema,
	selectWorkspaceTracksSchema,
	updateTrackSchema,
} from '@barely/validators';
import { and, desc, eq, inArray, isNull, lt, notInArray, or } from 'drizzle-orm';
import { z } from 'zod/v4';

import {
	createTrack,
	getTrackById,
	getTrackBySpotifyId,
	getTrackWith_Workspace_Genres_Files__fromRawTrack,
	trackWith_workspace_genres_files,
} from '../../functions/track.fns';
import { pushEvent } from '../../integrations/pusher/pusher-server';
import { privateProcedure, publicProcedure, workspaceProcedure } from '../trpc';

export const trackRoute = {
	byId: privateProcedure
		.input(z.object({ trackId: z.string() }))
		.query(async ({ input }) => {
			return await getTrackById(input.trackId);
		}),

	byWorkspace: workspaceProcedure
		.input(selectWorkspaceTracksSchema)
		.query(async ({ ctx, input }) => {
			const { limit, cursor, search, showArchived } = input;

			const rawTracks = await dbHttp.query.Tracks.findMany({
				with: trackWith_workspace_genres_files,
				where: sqlAnd([
					eq(Tracks.workspaceId, ctx.workspace.id),
					!!search?.length && or(eq(Tracks.name, search), eq(Tracks.spotifyId, search)),
					showArchived ? undefined : isNull(Tracks.archivedAt),
					!!cursor &&
						or(
							lt(Tracks.createdAt, cursor.createdAt),
							and(eq(Tracks.createdAt, cursor.createdAt), lt(Tracks.id, cursor.id)),
						),
				]),

				orderBy: [desc(Tracks.createdAt), desc(Tracks.id)],
				limit: limit + 1,
			});

			const tracks = rawTracks.map(rawTrack =>
				getTrackWith_Workspace_Genres_Files__fromRawTrack(rawTrack),
			);

			let nextCursor: typeof cursor | undefined = undefined;

			if (tracks.length > limit) {
				const nextTrack = tracks.pop();
				nextCursor =
					nextTrack ?
						{
							id: nextTrack.id,
							createdAt: nextTrack.createdAt,
						}
					:	undefined;
			}

			return {
				tracks,
				nextCursor,
			};

			// return await getTracksByWorkspaceId(ctx.workspace.id, ctx.db);
		}),

	bySpotifyId: publicProcedure.input(z.string()).query(async ({ input }) => {
		return await getTrackBySpotifyId(input);
	}),

	existsBySpotifyId: publicProcedure.input(z.string()).query(async ({ input }) => {
		const track = await dbHttp.query.Tracks.findFirst({
			where: eq(Tracks.spotifyId, input),
			columns: {
				id: true,
			},
		});

		return !!track;
	}),

	// create
	create: workspaceProcedure.input(createTrackSchema).mutation(async ({ ctx, input }) => {
		return await createTrack(input, ctx.workspace.id, ctx.pool);
	}),

	// update
	update: workspaceProcedure.input(updateTrackSchema).mutation(async ({ ctx, input }) => {
		const { id, ...updateData } = input;

		console.log('updateData', updateData);

		const { _genres, _artworkFiles, _audioFiles, ...data } = updateData;

		console.log('_audioFiles', _audioFiles);

		await dbHttp
			.update(Tracks)
			.set(data)
			.where(and(eq(Tracks.id, id), eq(Tracks.workspaceId, ctx.workspace.id)));

		if (_genres?.length) {
			await dbHttp
				.delete(_Tracks_To_Genres)
				.where(
					and(
						eq(_Tracks_To_Genres.trackId, id),
						notInArray(_Tracks_To_Genres.genreId, _genres),
					),
				);

			await dbHttp.insert(_Tracks_To_Genres).values(
				_genres.map(genreId => ({
					trackId: id,
					genreId,
				})),
			);
		}

		if (_artworkFiles?.length) {
			// if one of the artworkFiles is marked as current, set all others to not current
			const currentArtworkFile = _artworkFiles.find(f => f.current);
			if (currentArtworkFile) {
				await dbHttp
					.update(_Files_To_Tracks__Artwork)
					.set({ current: null })
					.where(eq(_Files_To_Tracks__Artwork.trackId, id));
			}

			await dbHttp.insert(_Files_To_Tracks__Artwork).values(
				_artworkFiles.map(_artworkFile => ({
					..._artworkFile,
					trackId: id,
				})),
			);
		}

		if (_audioFiles?.length) {
			// if one of the audioFiles is marked as masterCompressed, set all others to not masterCompressed
			const masterCompressedAudioFile = _audioFiles.find(f => f.masterCompressed);
			if (masterCompressedAudioFile) {
				await dbPool(ctx.pool)
					.update(_Files_To_Tracks__Audio)
					.set({ masterCompressed: null })
					.where(eq(_Files_To_Tracks__Audio.trackId, id));
			}

			// if one of the audioFiles is marked as masterWav, set all others to not masterWav
			const masterWavAudioFile = _audioFiles.find(f => f.masterWav);
			if (masterWavAudioFile) {
				await dbPool(ctx.pool)
					.update(_Files_To_Tracks__Audio)
					.set({ masterWav: null })
					.where(eq(_Files_To_Tracks__Audio.trackId, id));
			}

			await dbPool(ctx.pool)
				.insert(_Files_To_Tracks__Audio)
				.values(
					_audioFiles.map(_audioFile => ({
						..._audioFile,
						trackId: id,
					})),
				);
		}
	}),

	updateGenres: privateProcedure
		.input(z.object({ trackId: z.string(), genres: z.array(insertGenreSchema) }))
		.mutation(async ({ input, ctx }) => {
			await dbPool(ctx.pool).transaction(async tx => {
				await tx.delete(_Tracks_To_Genres).where(
					sqlAnd([
						eq(_Tracks_To_Genres.trackId, input.trackId),
						input.genres.length > 0 &&
							notInArray(
								_Tracks_To_Genres.genreId,
								input.genres.map(g => g.id),
							),
					]),
				);

				await Promise.allSettled(
					input.genres.map(g => {
						return tx
							.insert(_Tracks_To_Genres)
							.values({
								trackId: input.trackId,
								genreId: g.id,
							})
							.onConflictDoNothing({
								target: [_Tracks_To_Genres.trackId, _Tracks_To_Genres.genreId],
							});
					}),
				);
			});

			await pushEvent('track', 'update', {
				id: input.trackId,
				pageSessionId: ctx.pageSessionId,
				socketId: ctx.pusherSocketId,
			});
		}),

	// delete
	archive: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ ctx, input }) => {
			await dbHttp
				.update(Tracks)
				.set({ archivedAt: new Date() })
				.where(
					and(eq(Tracks.workspaceId, ctx.workspace.id), inArray(Tracks.id, input.ids)),
				);
		}),

	delete: workspaceProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ ctx, input }) => {
			await dbHttp
				.update(Tracks)
				.set({
					deletedAt: new Date(),
				})
				.where(
					and(eq(Tracks.workspaceId, ctx.workspace.id), inArray(Tracks.id, input.ids)),
				);
		}),
} satisfies TRPCRouterRecord;

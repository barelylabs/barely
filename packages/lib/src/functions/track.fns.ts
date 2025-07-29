import type { DbPoolTransaction, NeonPool } from '@barely/db/pool';
import type {
	createTrackSchema,
	InsertTrack,
	TrackWith_Workspace_Genres_Files,
} from '@barely/validators/schemas';
import type { z } from 'zod/v4';
import { dbHttp } from '@barely/db/client';
import { dbPool } from '@barely/db/pool';
import {
	_Files_To_Tracks__Artwork,
	_Files_To_Tracks__Audio,
	_Tracks_To_Genres,
	Tracks,
} from '@barely/db/sql';
import { newId } from '@barely/utils';
import { eq } from 'drizzle-orm';

export const trackWith_workspace_genres_files = {
	workspace: true,
	_genres: {
		with: {
			genre: true,
		},
	},
	_artworkFiles: {
		with: {
			file: true,
		},
	},
	_audioFiles: {
		with: {
			file: true,
		},
	},
	_albums: {
		with: {
			album: true,
		},
	},
} as const;

export async function getRawTrackById(id: string) {
	const track = await dbHttp.query.Tracks.findFirst({
		where: eq(Tracks.id, id),
		with: trackWith_workspace_genres_files,
	});

	return track ?? null;
}

type RawTrackWith_Workspace_Genres_Files = NonNullable<
	Awaited<ReturnType<typeof getRawTrackById>>
>;

export function getTrackWith_Workspace_Genres_Files__fromRawTrack(
	rawTrack: RawTrackWith_Workspace_Genres_Files,
) {
	const { _genres, _artworkFiles, _audioFiles, _albums, ...trackData } = rawTrack;

	return {
		...trackData,
		spotifyPopularity: trackData.spotifyPopularity ?? 0,
		genres: _genres.map(_g => _g.genre),
		artworkFiles: _artworkFiles.map(_f => ({
			..._f.file,
			current: _f.current,
		})),
		audioFiles: _audioFiles.map(_f => ({
			..._f.file,
			masterCompressed: _f.masterCompressed,
			masterWav: _f.masterWav,
			instrumentalCompressed: _f.instrumentalCompressed,
			instrumentalWav: _f.instrumentalWav,
			stem: _f.stem,
		})),
		_albums: _albums.map(_a => ({
			album: _a.album,
			trackNumber: _a.trackNumber,
		})),
	} satisfies TrackWith_Workspace_Genres_Files;
}

export async function getTrackById(id: string) {
	const rawTrack = await dbHttp.query.Tracks.findFirst({
		where: eq(Tracks.id, id),
		with: trackWith_workspace_genres_files,
	});

	if (!rawTrack) return null;

	return getTrackWith_Workspace_Genres_Files__fromRawTrack(rawTrack);
}

export async function getTracksByWorkspaceId(
	workspaceId: string,
): Promise<TrackWith_Workspace_Genres_Files[]> {
	const rawTracks = await dbHttp.query.Tracks.findMany({
		where: eq(Tracks.workspaceId, workspaceId),
		with: trackWith_workspace_genres_files,
	});

	const tracks = rawTracks.map(rawTrack => {
		return getTrackWith_Workspace_Genres_Files__fromRawTrack(rawTrack);
	});

	return tracks;
}

export async function getTrackBySpotifyId(
	spotifyId: string,
): Promise<TrackWith_Workspace_Genres_Files | null> {
	const rawTrack = await dbHttp.query.Tracks.findFirst({
		where: eq(Tracks.spotifyId, spotifyId),
		with: trackWith_workspace_genres_files,
	});

	if (!rawTrack) return null;

	return getTrackWith_Workspace_Genres_Files__fromRawTrack(rawTrack);
}

async function createTrackTx(
	input: z.infer<typeof createTrackSchema>,
	workspaceId: string,
	tx: DbPoolTransaction,
) {
	const { _genres, _artworkFiles, _audioFiles, ...data } = input;

	const newTrack: InsertTrack = {
		...data,
		id: newId('track'),
		workspaceId: workspaceId,
	};

	await tx.insert(Tracks).values(newTrack);

	if (_genres?.length) {
		await tx.insert(_Tracks_To_Genres).values(
			_genres.map(genreId => ({
				genreId,
				trackId: newTrack.id,
			})),
		);
	}

	if (_artworkFiles?.length) {
		await tx.insert(_Files_To_Tracks__Artwork).values(
			_artworkFiles.map(_artworkFile => ({
				..._artworkFile,
				trackId: newTrack.id,
			})),
		);
	}

	if (_audioFiles?.length) {
		await tx.insert(_Files_To_Tracks__Audio).values(
			_audioFiles.map(_audioFile => ({
				..._audioFile,
				trackId: newTrack.id,
			})),
		);
	}

	return newTrack;
}

export async function createTrack(
	input: z.infer<typeof createTrackSchema>,
	workspaceId: string,
	pool: NeonPool,
	tx?: DbPoolTransaction,
) {
	if (tx) {
		const newTrack = await createTrackTx(input, workspaceId, tx);
		return getTrackById(newTrack.id);
	} else {
		return await dbPool(pool).transaction(async tx => {
			const newTrack = await createTrackTx(input, workspaceId, tx);
			return getTrackById(newTrack.id);
		});
	}

	// const { _genres, _artworkFiles, _audioFiles, ...data } = input;

	// const newTrack: InsertTrack = {
	//   ...data,
	//   id: newId("track"),
	//   workspaceId: workspaceId,
	// };

	// await db.pool.insert(Tracks).values(newTrack);

	// if (_genres?.length) {
	//   await db.pool.insert(_Tracks_To_Genres).values(
	//     _genres.map((genreId) => ({
	//       genreId,
	//       trackId: newTrack.id,
	//     })),
	//   );
	// }

	// if (_artworkFiles?.length) {
	//   console.log("creating artwork join", _artworkFiles);
	//   await db.pool.insert(_Files_To_Tracks__Artwork).values(
	//     _artworkFiles.map((_artworkFile) => ({
	//       ..._artworkFile,
	//       trackId: newTrack.id,
	//     })),
	//   );
	// }

	// console.log("_audioFiles", _audioFiles);

	// if (_audioFiles?.length) {
	//   console.log("creating audio joins", _audioFiles);
	//   await db.pool.insert(_Files_To_Tracks__Audio).values(
	//     _audioFiles.map((_audioFile) => ({
	//       ..._audioFile,
	//       trackId: newTrack.id,
	//     })),
	//   );
	// }

	// return await getTrackById(newTrack.id, db);
}

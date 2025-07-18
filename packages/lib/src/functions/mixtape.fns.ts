import type { Db } from '@barely/db/client';
import type { NeonPool } from '@barely/db/pool';
import type { MixtapeWith_Tracks } from '@barely/validators/schemas';
import { dbPool } from '@barely/db/pool';
import { Mixtapes } from '@barely/db/sql/mixtape.sql';
import { sqlAnd } from '@barely/db/utils';
import { asc, eq, isNull } from 'drizzle-orm';

import { trackWith_workspace_genres_files } from './track.fns';

export async function getRawMixtapeById(id: string, pool: NeonPool) {
	const mixtape = await dbPool(pool).query.Mixtapes.findFirst({
		where: eq(Mixtapes.id, id),
		with: {
			_tracks: {
				orderBy: _tracks => [asc(_tracks.lexorank)],
				with: {
					track: {
						with: trackWith_workspace_genres_files,
					},
				},
			},
		},
	});

	return mixtape ?? null;
}

type RawMixtapeWith_Tracks = NonNullable<Awaited<ReturnType<typeof getRawMixtapeById>>>;

export function getMixtapeWith_Tracks__fromRawMixtape(rawMixtape: RawMixtapeWith_Tracks) {
	const { _tracks, ...mixtapeData } = rawMixtape;

	return {
		...mixtapeData,
		tracks: _tracks.map(_t => ({
			..._t.track,
			genres: _t.track._genres.map(_g => _g.genre),
			lexorank: _t.lexorank,
		})),
	} satisfies MixtapeWith_Tracks;
}

export async function getMixtapeById(
	id: string,
	pool: NeonPool,
): Promise<MixtapeWith_Tracks | null> {
	const rawMixtape = await getRawMixtapeById(id, pool);
	return rawMixtape ? getMixtapeWith_Tracks__fromRawMixtape(rawMixtape) : null;
}

export async function getMixtapesByWorkspaceId(
	workspaceId: string,
	db: Db,
	{ includeDeleted = false } = {},
): Promise<MixtapeWith_Tracks[]> {
	const mixtapes = await db.http.query.Mixtapes.findMany({
		where: sqlAnd([
			eq(Mixtapes.workspaceId, workspaceId),
			!includeDeleted ? isNull(Mixtapes.deletedAt) : null,
		]),
		with: {
			_tracks: {
				orderBy: _tracks => [asc(_tracks.lexorank)],
				with: {
					track: {
						with: trackWith_workspace_genres_files,
					},
				},
			},
		},
	});

	return mixtapes.map(getMixtapeWith_Tracks__fromRawMixtape);
}

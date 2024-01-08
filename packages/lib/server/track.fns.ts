import { newId } from '../utils/id';
import { Db, DbPoolTransaction } from './db';
import { CreateTrack } from './track.schema';
import { Tracks } from './track.sql';

export async function createTrack(track: CreateTrack, db: Db, tx?: DbPoolTransaction) {
	const newTrackId = newId('track');

	const dbTrack = (
		await (tx ?? db.writePool)
			.insert(Tracks)
			.values({
				...track,
				id: newTrackId,
			})
			.returning()
	)[0];

	return dbTrack;
}

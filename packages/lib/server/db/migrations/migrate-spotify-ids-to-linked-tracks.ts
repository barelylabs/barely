import { and, eq, isNotNull } from 'drizzle-orm';
import { dbHttp } from '../index';
import { SpotifyLinkedTracks, Tracks } from '../../routes/track/track.sql';

export async function migrateSpotifyIdsToLinkedTracks() {
	console.log('Starting migration of Spotify IDs to SpotifyLinkedTracks...');

	// Get all tracks with spotifyId
	const tracksWithSpotifyId = await dbHttp.query.Tracks.findMany({
		where: isNotNull(Tracks.spotifyId),
		columns: {
			id: true,
			spotifyId: true,
			spotifyPopularity: true,
		},
	});

	console.log(`Found ${tracksWithSpotifyId.length} tracks with Spotify IDs`);

	let migrated = 0;
	let skipped = 0;

	for (const track of tracksWithSpotifyId) {
		if (!track.spotifyId) continue;

		// Check if this Spotify ID is already in SpotifyLinkedTracks
		const existingLink = await dbHttp.query.SpotifyLinkedTracks.findFirst({
			where: and(
				eq(SpotifyLinkedTracks.trackId, track.id),
				eq(SpotifyLinkedTracks.spotifyLinkedTrackId, track.spotifyId),
			),
		});

		if (existingLink) {
			console.log(`Skipping track ${track.id} - already has linked Spotify ID`);
			skipped++;
			continue;
		}

		// Insert into SpotifyLinkedTracks
		await dbHttp.insert(SpotifyLinkedTracks).values({
			trackId: track.id,
			spotifyLinkedTrackId: track.spotifyId,
			spotifyPopularity: track.spotifyPopularity,
			isDefault: true, // Existing spotifyId becomes the default
		});

		migrated++;
		console.log(`Migrated track ${track.id} with Spotify ID ${track.spotifyId}`);
	}

	console.log(`Migration complete. Migrated: ${migrated}, Skipped: ${skipped}`);
}

// Run the migration if this file is executed directly
if (require.main === module) {
	migrateSpotifyIdsToLinkedTracks()
		.then(() => {
			console.log('Migration finished successfully');
			process.exit(0);
		})
		.catch(error => {
			console.error('Migration failed:', error);
			process.exit(1);
		});
}
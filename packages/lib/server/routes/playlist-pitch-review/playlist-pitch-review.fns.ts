import { desc, eq, inArray } from 'drizzle-orm';

import type { Db } from '../../db';
import type { InsertPlaylistPitchReview } from './playlist-pitch-review-schema';
import { newId } from '../../../utils/id';
import { dbHttp } from '../../db';
import { getCampaignById } from '../campaign/campaign.fns';
import { _Playlists_To_Genres, _Tracks_To_Genres } from '../genre/genre.sql';
import { PlaylistPitchReviews } from './playlist-pitch-review.sql';

const assignPlaylistPitchToReviewers = async (campaignId: string) => {
	const campaign = await getCampaignById(campaignId);

	if (!campaign.curatorReach) throw new Error('Campaign curator reach not set');

	// 🤹‍♂️ randomly select curators from all curators

	// 🚧 fixme: i would rather randomly query the curators from the db,
	// but i don't know how to do that w/o raw sql.
	// this method should be fine until the number of curators is large

	// 💡 a hacky way to do this could be to generate a random cuid and then query for curators with ids less/than greater than that
	// if a random cuid is generated for every curator, I think that'd be a random selection

	// for filtering, i think this would be better/more efficient with nested where relational queries, if/when drizzle implements those
	// i.e. allAvailableCurators = users where:
	// pitchReviewing==true
	// && accounts.some(spotifyPlaylists.some(playlistGenres.some(genre.trackGenres.some(track.id==campaign.track.id))))
	// && playlistPitchReviews.every(campaign.id!=campaignId)

	// const allPlaylists = await db.http.query.Playlists.findMany({
	// 	where: Playlists => and(
	// 		isNotNull(Playlists.curatorId),
	// 	),
	// 	with: {
	// 		_providerAccounts: true,
	// 		_genres: {
	// 	}
	// })

	const allGenres = await dbHttp.query._Playlists_To_Genres.findMany({
		where: inArray(
			_Playlists_To_Genres.genreId,
			campaign.track.genres.map(g => g.id),
		),
		with: {
			playlist: {
				with: {
					curator: {
						columns: {
							id: true,
							pitchReviewing: true,
						},
						with: {
							playlistPitchReviews: {
								columns: {
									campaignId: true,
								},
							},
						},
					},
				},
			},
		},
	});

	const allCurators = allGenres
		.map(_g => _g.playlist.curator)
		.filter(curator => curator?.pitchReviewing)
		.filter(curator =>
			curator?.playlistPitchReviews.every(r => r.campaignId !== campaignId),
		)
		.filter(c => !!c);

	const randomCurators = allCurators
		.sort(() => Math.random() - 0.5)
		.slice(0, campaign.curatorReach);

	if (randomCurators.length < campaign.curatorReach) {
		throw new Error(
			`Not enough curators to review this campaign. ${randomCurators.length} curators found, ${campaign.curatorReach} required`,
		);
	}

	const reviews = randomCurators.map(curator => {
		const review: InsertPlaylistPitchReview = {
			id: newId('playlistPitchReview'),
			campaignId,
			reviewerId: curator.id,
			stage: 'reviewing',
			review: '',
			rating: 0,
			expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days from now in ms
		};

		return review;
	});

	return await dbHttp.insert(PlaylistPitchReviews).values(reviews);
};

const getPlaylistPitchReviewsByCampaignId = async (campaignId: string, db: Db) => {
	const reviews = await db.http.query.PlaylistPitchReviews.findMany({
		where: eq(PlaylistPitchReviews.campaignId, campaignId),
		orderBy: desc(PlaylistPitchReviews.createdAt),
		limit: 20,
	});

	return reviews;
};

export { assignPlaylistPitchToReviewers, getPlaylistPitchReviewsByCampaignId };

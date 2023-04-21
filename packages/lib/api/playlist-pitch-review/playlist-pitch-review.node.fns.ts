import { prisma } from '@barely/db';

import { getCampaignById } from '../campaign/campaign.node.fns';

const assignPlaylistPitchToReviewers = async (campaignId: string) => {
	const campaign = await getCampaignById(campaignId, { requireTrack: true });

	if (!campaign) throw new Error('Campaign not found');
	if (!campaign.curatorReach) throw new Error('Campaign curator reach not set');

	// 🤹‍♂️ randomly select curators from all curators

	// 🚧 fixme: i would rather randomly query the curators from the db,
	// but i don't know how to do that w/o raw sql.
	// this method should be fine until the number of curators is large

	// 💡 a hacky way to do this could be to generate a random cuid and then query for curators with ids less/than greater than that
	// if a random cuid is generated for every curator, I think that'd be a random selection

	const allAvailableCurators = await prisma.user.findMany({
		where: {
			pitchReviewing: true,
			// have at least one playlist that matches at least one genre of the track
			accounts: {
				some: {
					spotifyPlaylists: {
						some: {
							playlistGenres: {
								some: {
									genre: {
										trackGenres: {
											some: {
												track: {
													id: campaign.track.id,
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},
			// make sure they haven't already reviewed this campaign
			playlistPitchReviews: {
				every: {
					campaign: {
						id: {
							not: campaignId,
						},
					},
				},
			},
		},
	});

	const randomCurators = allAvailableCurators
		.sort(() => Math.random() - 0.5)
		.slice(0, campaign.curatorReach);

	if (randomCurators.length < campaign.curatorReach) {
		throw new Error(
			`Not enough curators to review this campaign. ${randomCurators.length} curators found, ${campaign.curatorReach} required`,
		);
	}

	const newPitchReviews = await prisma.playlistPitchReview.createMany({
		data: randomCurators.map(curator => ({
			campaignId,
			reviewerId: curator.id,
			stage: 'reviewing',
			review: '',
			rating: 0,
			expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now in ms
		})),
	});

	return;
};

const getPlaylistPitchReviewsByCampaignId = async (campaignId: string) => {
	const reviews = await prisma.playlistPitchReview.findMany({
		where: {
			campaignId,
		},
		take: 20,
		orderBy: {
			createdAt: 'desc',
		},
	});

	return reviews;
};

export { assignPlaylistPitchToReviewers, getPlaylistPitchReviewsByCampaignId };

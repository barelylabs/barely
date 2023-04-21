import { z } from 'zod';

import { campaignSchema } from './campaign.schema';

const campaignTypeDisplay = (type: z.infer<typeof campaignSchema.shape.type>) => {
	switch (type) {
		case 'playlistPitch':
			return 'playlist.pitch';
		case 'fbSpark':
			return 'fb.spark';
		case 'fbCharge':
			return 'fb.charge';
		case 'igSpark':
			return 'ig.spark';
		case 'igCharge':
			return 'ig.charge';
		case 'playlistSpark':
			return 'playlist.spark';
		case 'spotifyCharge':
			return 'spotify.charge';
		default:
			return 'Unknown';
	}
};

const playlistPitchCostInDollars = ({ curatorReach }: { curatorReach: number }) => {
	console.log('curatorReach is', curatorReach);

	const cost =
		curatorReach <= 10
			? 10 * curatorReach
			: curatorReach <= 20
			? 10 * 10 + 9 * (curatorReach - 10)
			: 10 * 10 + 9 * 10 + 8 * (curatorReach - 20);

	return Math.ceil(cost / 5) * 5;
};

export { campaignTypeDisplay, playlistPitchCostInDollars };

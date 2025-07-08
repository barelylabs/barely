import type { Campaign } from '@barely/validators/schemas';

export function campaignTypeDisplay(type: Campaign['type']) {
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
}

export function playlistPitchCostInDollars(props: { curatorReach: number }) {
	// console.log('curatorReach is', props.curatorReach);

	const cost =
		props.curatorReach <= 10 ? 10 * props.curatorReach
		: props.curatorReach <= 20 ? 10 * 10 + 9 * (props.curatorReach - 10)
		: 10 * 10 + 9 * 10 + 8 * (props.curatorReach - 20);

	return Math.ceil(cost / 5) * 5;
}

import { atom } from 'jotai';

import { pusherAtom } from '@barely/atoms/pusher.atom';

const campaignChannelAtom = atom(get => {
	const client = get(pusherAtom);
	const channel = client.subscribe('campaigns');
	return channel;
});

const trackChannelAtom = atom(get => {
	const client = get(pusherAtom);
	const channel = client.subscribe('tracks');
	return channel;
});

export { campaignChannelAtom, trackChannelAtom };

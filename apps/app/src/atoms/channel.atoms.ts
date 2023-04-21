import { atom } from 'jotai';

import { pusherClientAtom } from '@barely/atoms/pusher.atom';

const campaignChannelAtom = atom(get => {
	const client = get(pusherClientAtom);
	const channel = client.subscribe('campaigns');
	return channel;
});

const trackChannelAtom = atom(get => {
	const client = get(pusherClientAtom);
	const channel = client.subscribe('tracks');
	return channel;
});

export { campaignChannelAtom, trackChannelAtom };

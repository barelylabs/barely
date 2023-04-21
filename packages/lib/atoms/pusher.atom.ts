import { atom } from 'jotai';
import Pusher from 'pusher-js';

import env from '../env';

let pusherClient: Pusher;
if (Pusher.instances.length) {
	pusherClient = Pusher.instances[0];
	pusherClient.connect();
} else {
	pusherClient = new Pusher(env.NEXT_PUBLIC_PUSHER_APP_KEY, {
		cluster: env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
		disableStats: true,
	});
}

const pusherClientAtom = atom(pusherClient);

export { pusherClientAtom };

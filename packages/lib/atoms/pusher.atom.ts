import { atomWithStorage } from 'jotai/utils';
import Pusher from 'pusher-js';

import env from '../env';

let pusher: Pusher | undefined;

if (Pusher.instances.length) {
	pusher = Pusher.instances[0];
	if (pusher !== undefined) {
		console.log('connecting to existing pusher instance...');
		pusher.connect();
	} else {
		// console.log(
		// 	'pusher.instances.length > 0, but pusher is undefined. creating a new instance...',
		// );
		pusher = new Pusher(env.NEXT_PUBLIC_PUSHER_APP_KEY, {
			cluster: env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
			disableStats: true,
		});
	}
} else {
	// console.log('pusher.instances.length === 0, creating a new instance...');
	pusher = new Pusher(env.NEXT_PUBLIC_PUSHER_APP_KEY, {
		cluster: env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
		disableStats: true,
	});
}

export const pusherAtom = atomWithStorage('pusher', pusher);

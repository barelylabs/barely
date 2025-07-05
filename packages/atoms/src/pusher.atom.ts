import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import Pusher from 'pusher-js';

import { atomsEnv } from './env';

let pusher: Pusher | undefined;

if (Pusher.instances.length) {
	pusher = Pusher.instances[0];
	if (pusher !== undefined) {
		pusher.connect();
	} else {
		pusher = new Pusher(atomsEnv.NEXT_PUBLIC_PUSHER_APP_KEY, {
			cluster: atomsEnv.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
			disableStats: true,
		});
	}
} else {
	pusher = new Pusher(atomsEnv.NEXT_PUBLIC_PUSHER_APP_KEY, {
		cluster: atomsEnv.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
		disableStats: true,
	});
}

export const pusherAtom = atomWithStorage('pusher', pusher);
export const pusherSocketIdAtom = atom(get => {
	const pusher = get(pusherAtom);
	return pusher.connection.socket_id;
});

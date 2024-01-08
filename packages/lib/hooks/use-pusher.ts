import { useAtomValue } from 'jotai';

import { pusherAtom } from '../atoms/pusher.atom';

export function usePusher() {
	const pusher = useAtomValue(pusherAtom);

	return pusher;
}

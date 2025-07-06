'use client';

import { useMemo } from 'react';
import { pusherAtom } from '@barely/atoms';
import { useAtomValue } from 'jotai';

export function usePusher() {
	const pusher = useAtomValue(pusherAtom);

	return pusher;
}

export function usePusherSocketId() {
	const pusher = useAtomValue(pusherAtom);

	const socketId = useMemo(() => {
		return pusher.connection.socket_id;
	}, [pusher.connection.socket_id]);

	return socketId;
}

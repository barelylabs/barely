'use client';

import { useMemo } from 'react';
import { useAtomValue } from 'jotai';

import { pusherAtom } from '@barely/atoms';

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

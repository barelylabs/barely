import { useEffect, useRef } from 'react';

import { Atom, useAtomValue } from 'jotai';
import { Channel } from 'pusher-js';

import { PageSession } from '../atoms/session.atom';

const useSubscribeToObject = (props: {
	id: string;
	channelAtom: Atom<Channel>;
	pageSessionAtom: Atom<PageSession>;
	callback: () => void | Promise<void>;
}) => {
	const channel = useAtomValue(props.channelAtom);
	const pageSession = useAtomValue(props.pageSessionAtom);
	const stableCallback = useRef(props.callback);

	useEffect(() => {
		stableCallback.current = props.callback;
	}, [props.callback]);

	useEffect(() => {
		const reference = async (props: { pageSessionId: string }) => {
			if (props.pageSessionId !== pageSession?.id) await stableCallback.current();
		};
		channel.bind(`updated-${props.id}`, reference);
		return () => {
			channel.unbind(`updated-${props.id}`, reference);
		};
	}, [channel, props.id, pageSession?.id]);
};

export { useSubscribeToObject };

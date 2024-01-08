import { useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';

import { pageSessionAtom } from '../atoms/session.atom';
import { ChannelName, eventSchema } from '../utils/pusher-client';
import { usePusher } from './use-pusher';

// export const useSubscribeToObject = (props: {
// 	id: string;
// 	channelAtom: Atom<Channel>;
// 	// pageSessionAtom: Atom<PageSession>;
// 	callback: () => void | Promise<void>;
// }) => {
// 	const channel = useAtomValue(props.channelAtom);
// 	const pageSession = useAtomValue(pageSessionAtom);
// 	const stableCallback = useRef(props.callback);

// 	useEffect(() => {
// 		stableCallback.current = props.callback;
// 	}, [props.callback]);

// 	useEffect(() => {
// 		const reference = async (props: { pageSessionId: string }) => {
// 			if (props.pageSessionId !== pageSession?.id) await stableCallback.current();
// 		};
// 		channel.bind(`updated-${props.id}`, reference);
// 		return () => {
// 			channel.unbind(`updated-${props.id}`, reference);
// 		};
// 	}, [channel, props.id, pageSession?.id]);
// };

type Sub = {
	channel: ChannelName;
	ids?: string[];
};

export function useSubscribe(props: {
	subscribeTo: Sub | Sub[];
	callback?: () => void | Promise<void>;
}) {
	const pusher = usePusher();

	const pageSession = useAtomValue(pageSessionAtom);
	const channels = useRef(
		!Array.isArray(props.subscribeTo)
			? [pusher.subscribe(props.subscribeTo.channel)]
			: props.subscribeTo.map(sub => pusher.subscribe(sub.channel)),
	);
	const stableCallback = useRef(props.callback);

	useEffect(() => {
		stableCallback.current = props.callback;
	}, [props.callback]);

	useEffect(() => {
		channels.current = !Array.isArray(props.subscribeTo)
			? [pusher.subscribe(props.subscribeTo.channel)]
			: props.subscribeTo.map(sub => pusher.subscribe(sub.channel));
	}, [props.subscribeTo]);

	useEffect(() => {
		const reference = async (refProps: { pageSessionId?: string | null }) => {
			if (!refProps.pageSessionId || refProps.pageSessionId !== pageSession?.id) {
				if (stableCallback.current) await stableCallback.current();
			}
		};

		channels.current.forEach(channel => {
			const ids = !Array.isArray(props.subscribeTo)
				? props.subscribeTo.ids
				: props.subscribeTo.find(sub => sub.channel === channel.name)?.ids;

			channel.bind('update', (data: unknown) => {
				const parsedUpdateData = eventSchema.safeParse(data);

				if (!parsedUpdateData.success) {
					console.error('failed to parse update data => ', parsedUpdateData.error);
					return;
				}

				if (!ids?.includes(parsedUpdateData.data.id)) return;

				return reference({ pageSessionId: parsedUpdateData.data.pageSessionId });
			});
		});

		return () => {
			channels.current.forEach(channel => {
				channel.unbind('update');
			});
		};
	}, [channels, props.subscribeTo, pageSession?.id]);
}

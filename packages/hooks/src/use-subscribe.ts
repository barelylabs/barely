'use client';

import type { AppRouterKeys } from '@barely/api/app/app.router';
import { useEffect, useRef } from 'react';
import { appEventSchema } from '@barely/lib/integrations/pusher/pusher-client';
import { useAtomValue } from 'jotai';

import { pageSessionAtom } from '@barely/atoms/session';

import { usePusher } from './use-pusher';

interface Sub {
	channel: AppRouterKeys;
	ids?: string[];
}

export function useSubscribe(props: {
	subscribeTo: Sub | Sub[];
	callback?: () => void | Promise<void>;
}) {
	const pusher = usePusher();

	const pageSession = useAtomValue(pageSessionAtom);
	const channels = useRef(
		!Array.isArray(props.subscribeTo) ?
			[pusher.subscribe(props.subscribeTo.channel)]
		:	props.subscribeTo.map(sub => pusher.subscribe(sub.channel)),
	);
	const stableCallback = useRef(props.callback);

	useEffect(() => {
		stableCallback.current = props.callback;
	}, [props.callback]);

	useEffect(() => {
		channels.current =
			!Array.isArray(props.subscribeTo) ?
				[pusher.subscribe(props.subscribeTo.channel)]
			:	props.subscribeTo.map(sub => pusher.subscribe(sub.channel));
	}, [props.subscribeTo]);

	useEffect(() => {
		const reference = async (refProps: { pageSessionId?: string | null }) => {
			if (!refProps.pageSessionId || refProps.pageSessionId !== pageSession.id) {
				if (stableCallback.current) await stableCallback.current();
			}
		};

		channels.current.forEach(channel => {
			const ids =
				!Array.isArray(props.subscribeTo) ?
					props.subscribeTo.ids
				:	props.subscribeTo.find(sub => sub.channel === channel.name)?.ids;

			channel.bind('update', (data: unknown) => {
				const parsedUpdateData = appEventSchema.safeParse(data);

				if (!parsedUpdateData.success) {
					console.error('failed to parse update data => ', parsedUpdateData.error);
					return;
				}

				if (!ids?.includes(parsedUpdateData.data.id)) return;

				return reference({
					pageSessionId: parsedUpdateData.data.pageSessionId,
				});
			});
		});

		return () => {
			channels.current.forEach(channel => {
				channel.unbind('update');
			});
		};
	}, [channels, props.subscribeTo, pageSession.id]);
}

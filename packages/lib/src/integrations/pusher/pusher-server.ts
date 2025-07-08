import Pusher from 'pusher-http-edge';

import type { ChannelName, EventName } from './pusher-client';
import { libEnv } from '../../../env';

// export type EventName = 'update' | 'create' | 'delete';
export type EventData = Record<string, unknown>;

export const pusherServer = new Pusher({
	appId: libEnv.NEXT_PUBLIC_PUSHER_APP_ID,
	key: libEnv.NEXT_PUBLIC_PUSHER_APP_KEY,
	secret: libEnv.PUSHER_APP_SECRET,
	cluster: libEnv.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
});

export function pushEvent(channel: ChannelName, event: EventName, data: EventData) {
	return pusherServer.trigger(
		channel,
		event,
		data,
		typeof data.socketId === 'string' ? { socket_id: data.socketId } : undefined,
	);
}

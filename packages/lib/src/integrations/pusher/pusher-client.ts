import { z } from 'zod/v4';

import type { AppRouterKeys } from '../../trpc/routes/app.route';

export type ChannelName = AppRouterKeys; // we can fix this another time. maybe pusher gets pulled into a separate package that is downstream of @barely/api
export type EventName = 'update' | 'create' | 'delete';

export const appEventSchema = z.object({
	id: z.string(),
	pageSessionId: z.string().nullish(),
	socketId: z.string().nullish(),
});

export type AppEventData = z.infer<typeof appEventSchema> & Record<string, unknown>;

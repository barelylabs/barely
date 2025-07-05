import { z } from 'zod/v4';

export const pusherEventSchema = z.object({
	id: z.string(),
	pageSessionId: z.string().nullish(),
	socketId: z.string().nullish(),
});

export type PusherEventData = z.infer<typeof pusherEventSchema> & Record<string, unknown>;

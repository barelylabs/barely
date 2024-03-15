import { z } from "zod";

import type { EdgeRouterInputs } from "../server/api/router.edge";

export type ChannelName = keyof EdgeRouterInputs;
export type EventName = "update" | "create" | "delete";

export const eventSchema = z.object({
  id: z.string(),
  pageSessionId: z.string().nullish(),
  socketId: z.string().nullish(),
});

export type EventData = z.infer<typeof eventSchema> & Record<string, unknown>;

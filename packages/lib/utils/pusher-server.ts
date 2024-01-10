import Pusher from "pusher-http-edge";

import type { ChannelName, EventData, EventName } from "./pusher-client";
import env from "../env";

export const pusherServer = new Pusher({
  appId: env.NEXT_PUBLIC_PUSHER_APP_ID,
  key: env.NEXT_PUBLIC_PUSHER_APP_KEY,
  secret: env.PUSHER_APP_SECRET,
  cluster: env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
});

export function pushEvent(
  channel: ChannelName,
  event: EventName,
  data: EventData,
) {
  return pusherServer.trigger(channel, event, data);
}

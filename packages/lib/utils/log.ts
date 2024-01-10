import { z } from "zod";

import env from "../env";
import { zPost } from "./zod-fetch";

export const log = async ({
  message,
  type,
  mention = false,
}: {
  message: string;
  type: "cron" | "link" | "stripe";
  mention?: boolean;
}) => {
  if (process.env.NODE_ENV === "development" || !env.BOT_THREADS_API_KEY)
    /* 
	Log a message to the console 
	*/
    console.log(message);

  try {
    /* 
		Log a message to Threads error channel 
		*/
    await zPost("https://threads.com/api/public/postThread", z.object({}), {
      auth: `Bearer ${env.BOT_THREADS_API_KEY}`,
      body: {
        channel: `${type}-errors`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `${mention ? "<@34548329863> " : ""}${message}`,
            },
          },
        ],
      },
      logResponse: true,
    });
  } catch (error) {
    console.log("Failed to log to Barely Threads. Error: ", error);
  }
};

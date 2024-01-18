import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

function getBaseUrl({ devPort = "", absolute = false }) {
  if (!absolute && typeof window !== "undefined") {
    return ""; // browser should use relative url
  }

  if (
    process.env.VERCEL_ENV === "production" ||
    process.env.VERCEL_ENV === "preview"
  ) {
    if (!process.env.VERCEL_URL) throw new Error("VERCEL_URL not found");
    return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  }

  if (!devPort || devPort.length === 0)
    console.error("devPort not found for base url");

  return `http://localhost:${devPort ?? ""}`; // dev SSR should use localhost
}

export const env = createEnv({
  server: {
    AUTH_URL: z.string().url().optional(),
    BOT_SPOTIFY_ACCOUNT_ID: z.string(),
    BOT_THREADS_API_KEY: z.string(),
    CLOUDINARY_API_SECRET: z.string(),
    DATABASE_URL: z.string(),
    DATABASE_POOL_URL: z.string(),
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),
    LOCALHOST_IP: z.string(),
    GANDI_API_KEY: z.string(),
    NAMESILO_API_KEY: z.string(),
    NEXTAUTH_SECRET: z.string(),
    OPENAI_API_KEY: z.string(),
    OPENAI_ORG_ID: z.string(),
    POSTMARK_SERVER_API_TOKEN: z.string(),
    PUSHER_APP_SECRET: z.string(),
    RESEND_API_KEY: z.string().optional(),
    SCREENING_PHONE_NUMBER: z.string(),
    SENDGRID_API_KEY: z.string(),
    SPOTIFY_CLIENT_ID: z.string(),
    SPOTIFY_CLIENT_SECRET: z.string(),
    STRIPE_SECRET_KEY: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),
    TINYBIRD_API_KEY: z.string(),
    TWILIO_ACCOUNT_SID: z.string(),
    TWILIO_AUTH_TOKEN: z.string(),
    TWILIO_PHONE_NUMBER: z.string(),
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string(),
    VERCEL_ENV: z.enum(["development", "preview", "production"]),
    VERCEL_LINK_PROJECT_ID: z.string(),
    VERCEL_TEAM_ID: z.string(),
    VERCEL_TOKEN: z.string(),
    VERCEL_URL: z.string(),
  },

  client: {
    NEXT_PUBLIC_APP_ABSOLUTE_BASE_URL: z.string(),
    NEXT_PUBLIC_APP_BASE_URL: z.string(),
    NEXT_PUBLIC_APP_DEV_PORT: z
      .string()
      .optional()
      .refine((v) => process.env.VERCEL_ENV !== "development" || !!v, {
        message: "You need a dev port in order to run the app locally",
      }),
    NEXT_PUBLIC_LINK_ABSOLUTE_BASE_URL: z.string(),
    NEXT_PUBLIC_LINK_BASE_URL: z.string(),
    NEXT_PUBLIC_LINK_DEV_PORT: z
      .string()
      .optional()
      .refine((v) => process.env.VERCEL_ENV !== "development" || !!v, {
        message: "You need a dev port in order to run the app locally",
      }),
    NEXT_PUBLIC_WWW_ABSOLUTE_BASE_URL: z.string(),
    NEXT_PUBLIC_WWW_BASE_URL: z.string(),
    NEXT_PUBLIC_WWW_DEV_PORT: z
      .string()
      .optional()
      .refine((v) => process.env.VERCEL_ENV !== "development" || !!v, {
        message: "You need a dev port in order to run the app locally",
      }),

    NEXT_PUBLIC_TRANSPARENT_LINK_ROOT_DOMAIN: z.string(),
    NEXT_PUBLIC_SHORT_LINK_ROOT_DOMAIN: z.string(),

    NEXT_PUBLIC_CLOUDINARY_API_KEY: z.string(),
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string(),
    NEXT_PUBLIC_PUSHER_APP_KEY: z.string(),
    NEXT_PUBLIC_PUSHER_APP_CLUSTER: z.string(),
    NEXT_PUBLIC_PUSHER_APP_ID: z.string(),
  },
  runtimeEnv: {
    // VARIABLES

    // CALCULATED (we're calculating these here to make it easier to use them in the app)
    NEXT_PUBLIC_APP_BASE_URL: getBaseUrl({
      devPort: process.env.NEXT_PUBLIC_APP_DEV_PORT,
    }),
    NEXT_PUBLIC_APP_ABSOLUTE_BASE_URL: getBaseUrl({
      devPort: process.env.NEXT_PUBLIC_APP_DEV_PORT,
      absolute: true,
    }),
    NEXT_PUBLIC_LINK_BASE_URL: getBaseUrl({
      devPort: process.env.NEXT_PUBLIC_LINK_DEV_PORT,
    }),
    NEXT_PUBLIC_LINK_ABSOLUTE_BASE_URL: getBaseUrl({
      devPort: process.env.NEXT_PUBLIC_LINK_DEV_PORT,
      absolute: true,
    }),
    NEXT_PUBLIC_WWW_BASE_URL: getBaseUrl({
      devPort: process.env.NEXT_PUBLIC_WWW_DEV_PORT,
    }),
    NEXT_PUBLIC_WWW_ABSOLUTE_BASE_URL: getBaseUrl({
      devPort: process.env.NEXT_PUBLIC_WWW_DEV_PORT,
      absolute: true,
    }),

    /**
     * We have to destructure all variables from process.env to keep from tree-shaking them away 🤦‍♂️
     * */

    // CLIENT
    NEXT_PUBLIC_APP_DEV_PORT: process.env.NEXT_PUBLIC_APP_DEV_PORT,
    NEXT_PUBLIC_WWW_DEV_PORT: process.env.NEXT_PUBLIC_WWW_DEV_PORT,
    NEXT_PUBLIC_LINK_DEV_PORT: process.env.NEXT_PUBLIC_LINK_DEV_PORT,
    NEXT_PUBLIC_TRANSPARENT_LINK_ROOT_DOMAIN:
      process.env.NEXT_PUBLIC_TRANSPARENT_LINK_ROOT_DOMAIN,
    NEXT_PUBLIC_SHORT_LINK_ROOT_DOMAIN:
      process.env.NEXT_PUBLIC_SHORT_LINK_ROOT_DOMAIN,
    NEXT_PUBLIC_CLOUDINARY_API_KEY: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_PUSHER_APP_KEY: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
    NEXT_PUBLIC_PUSHER_APP_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
    NEXT_PUBLIC_PUSHER_APP_ID: process.env.NEXT_PUBLIC_PUSHER_APP_ID,

    // SERVER
    AUTH_URL: process.env.AUTH_URL,
    BOT_SPOTIFY_ACCOUNT_ID: process.env.BOT_SPOTIFY_ACCOUNT_ID,
    BOT_THREADS_API_KEY: process.env.BOT_THREADS_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_POOL_URL: process.env.DATABASE_POOL_URL,
    GANDI_API_KEY: process.env.GANDI_API_KEY,
    LOCALHOST_IP: process.env.LOCALHOST_IP,
    NAMESILO_API_KEY: process.env.NAMESILO_API_KEY,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_ORG_ID: process.env.OPENAI_ORG_ID,
    POSTMARK_SERVER_API_TOKEN: process.env.POSTMARK_SERVER_API_TOKEN,
    PUSHER_APP_SECRET: process.env.PUSHER_APP_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    SCREENING_PHONE_NUMBER: process.env.SCREENING_PHONE_NUMBER,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    TINYBIRD_API_KEY: process.env.TINYBIRD_API_KEY,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_LINK_PROJECT_ID: process.env.VERCEL_LINK_PROJECT_ID,
    VERCEL_TEAM_ID: process.env.VERCEL_TEAM_ID,
    VERCEL_TOKEN: process.env.VERCEL_TOKEN,
    VERCEL_URL: process.env.VERCEL_URL,
  },
});

import type { ZodObject, ZodRawShape } from "zod";
import { z } from "zod";

function getBaseUrl({
  devPort,
  absolute = false,
}: {
  devPort?: string;
  absolute?: boolean;
}) {
  if (!absolute && typeof window !== "undefined") {
    return ""; // browser should use relative url
  }

  const vercelEnv =
    process.env.VERCEL_ENV ?? process.env.NEXT_PUBLIC_VERCEL_ENV ?? "fucked";
  const vercelUrl =
    process.env.VERCEL_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL ?? "urlfucked";

  console.log("process.env.VERCEL_ENV => ", vercelEnv);
  console.log("process.env.VERCEL_URL => ", vercelUrl);
  if (vercelEnv === "production" || vercelEnv === "preview") {
    if (!vercelUrl) throw new Error("VERCEL_URL not found");
    return `https://${vercelUrl}`; // SSR should use vercel url
  }

  if (!devPort) console.error("devPort not found for base url, yo.");

  return `http://localhost:${devPort ?? ""}`; // dev SSR should use localhost
}

export const allClientEnvSchema = z.object({
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
});

/**
 * fixme: I don't like having this type defined in 2 places, but @barely/env doesn't have access to types from @barely/lib
 * referencing lib/utils/upstash
 * */
type RateLimitTime =
  | `${number} ms`
  | `${number} s`
  | `${number} m`
  | `${number} h`
  | `${number} d`;

export const allServerEnvSchema = z.object({
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
  RATE_LIMIT_RECORD_LINK_CLICK: z
    .string()
    .refine(
      (v) => {
        const isValid = /^\d+\s[msdh](s)?$/i.test(v);
        return isValid;
      },
      {
        message: "Rate limit must be in the format: {number} {ms|s|m|h|d|ms}",
      },
    )
    .transform((v) => {
      return v as RateLimitTime;
    })
    .optional()
    .default("1 h"),
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
});

// function mapZodSchemaToEnv(schema: ZodRawShape) {
// 	const result: Record<string, string | undefined> = {};
// 	for (const key in schema) {
// 		result[key] = process.env[key];
// 	}
// 	return result;
// }

const processEnv = {
  // VARIABLES
  RATE_LIMIT_RECORD_LINK_CLICK: process.env.RATE_LIMIT_RECORD_LINK_CLICK,

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
  AUTH_SECRET: process.env.AUTH_SECRET,
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
  NEXTAUTH_URL_INTERNAL: process.env.NEXTAUTH_URL_INTERNAL,
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
};

function safePick<T extends z.ZodObject<ZodRawShape>>(
  schema: T,
  keys: (keyof z.infer<T>)[],
): ZodObject<
  Pick<ReturnType<T["_def"]["shape"]>, (typeof keys)[number]>,
  T["_def"]["unknownKeys"],
  T["_def"]["catchall"]
> {
  const pickObj: Record<string, true> = {};
  keys.forEach((key) => {
    pickObj[key as string] = true;
  });

  return schema.pick(pickObj) as ZodObject<
    Pick<ReturnType<T["_def"]["shape"]>, (typeof keys)[number]>,
    T["_def"]["unknownKeys"],
    T["_def"]["catchall"]
  >;
}

export function pickServerEnvSchema(
  keys: (keyof z.infer<typeof allServerEnvSchema>)[],
) {
  return safePick(allServerEnvSchema, keys);
}

export function pickClientEnvSchema(
  keys: (keyof z.infer<typeof allClientEnvSchema>)[],
) {
  return safePick(allClientEnvSchema, keys);
}

export function zEnv<TClient extends ZodRawShape, TServer extends ZodRawShape>({
  clientEnvSchema,
  serverEnvSchema,
}: {
  clientEnvSchema: z.ZodObject<TClient>;
  serverEnvSchema: z.ZodObject<TServer>;
}) {
  const isServer = typeof window === "undefined";

  const merged = serverEnvSchema.merge(clientEnvSchema);

  const parsed = isServer
    ? merged.safeParse(processEnv)
    : clientEnvSchema.safeParse(processEnv);

  if (!parsed?.success) {
    console.log("error => ", parsed.error);
    console.error(
      "❌ Invalid environment variables ->\n",
      ...formatErrors(parsed.error.format()),
    );
    throw new Error("Invalid environment variables");
  }

  const env = new Proxy(parsed.data, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      if (!isServer && !prop.startsWith("NEXT_PUBLIC_"))
        throw new Error(
          `❌ Attempted to access server-side environment variable '${prop}' on the client`,
        );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      if (prop in target) return target[prop as keyof typeof target];

      return undefined;
    },
  }) as z.infer<typeof merged>; // not ideal to cast it this way, but should be typesafe due to isServer guard above

  return env;
}

const formatErrors = (
  errors: z.ZodFormattedError<Map<string, string>, string>,
) =>
  Object.entries(errors)
    .map(([name, value]) => {
      if (value && "_errors" in value)
        return `${name}: ${value._errors.join(", ")}\n`;
    })
    .filter(Boolean);

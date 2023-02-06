import { z, ZodRawShape } from 'zod';

function getBaseUrl(devPort?: string) {
	if (typeof window !== 'undefined') {
		return ''; // browser should use relative url
	}

	if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'preview') {
		if (!process.env.VERCEL_URL) throw new Error('VERCEL_URL not found');
		return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
	}

	if (!devPort) throw new Error('devPort not found');
	return `http://localhost:${devPort}`; // dev SSR should use localhost
}

const processEnv = {
	// CLIENT
	NEXT_PUBLIC_APP_BASE_URL: getBaseUrl(process.env.NEXT_PUBLIC_APP_DEV_PORT),
	NEXT_PUBLIC_WEB_BASE_URL: getBaseUrl(process.env.NEXT_PUBLIC_WEB_DEV_PORT),
	NEXT_PUBLIC_LINK_BASE_URL: getBaseUrl(process.env.NEXT_PUBLIC_LINK_DEV_PORT),

	// NEXT_PUBLIC_APP_DEV_PORT: process.env.NEXT_PUBLIC_APP_DEV_PORT,
	// NEXT_PUBLIC_WEB_DEV_PORT: process.env.NEXT_PUBLIC_WEB_DEV_PORT,
	// NEXT_PUBLIC_LINK_DEV_PORT: process.env.NEXT_PUBLIC_LINK_DEV_PORT,
	NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,

	// SERVER
	VERCEL_URL: process.env.VERCEL_URL,

	NODE_ENV: process.env.NODE_ENV,

	BOT_USER_ID: process.env.BOT_USER_ID,
	CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
	CLERK_WEBHOOK_USER_SECRET_KEY: process.env.CLERK_WEBHOOK_USER_SECRET_KEY,

	DATABASE_URL: process.env.DATABASE_URL,
	OPENAI_API_KEY: process.env.OPENAI_API_KEY,
	OPENAI_ORG_ID: process.env.OPENAI_ORG_ID,
	POSTMARK_SERVER_API_TOKEN: process.env.POSTMARK_SERVER_API_TOKEN,
	SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
	SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
	SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
	TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
	TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
	TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
};

export const clientEnvAllSchema = z.object({
	// NEXT_PUBLIC_APP_BASE_URL: z.string(),
	// NEXT_PUBLIC_WEB_BASE_URL: z.string(),
	// NEXT_PUBLIC_LINK_BASE_URL: z.string(),
	NEXT_PUBLIC_APP_DEV_PORT: z.string(),
	NEXT_PUBLIC_WEB_DEV_PORT: z.string(),
	NEXT_PUBLIC_LINK_DEV_PORT: z.string(),
	NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
});

export const serverEnvAllSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']),

	BOT_USER_ID: z.string(),

	CLERK_SECRET_KEY: z.string().min(1),
	CLERK_WEBHOOK_USER_SECRET_KEY: z.string().min(1),

	// EXTERNAL
	DATABASE_URL: z.string().url(),
	DISCORD_CLIENT_ID: z.string(),
	DISCORD_CLIENT_SECRET: z.string(),
	MAGIC_SECRET_KEY: z.string(),
	OPENAI_API_KEY: z.string(),
	OPENAI_ORG_ID: z.string(),
	POSTMARK_SERVER_API_TOKEN: z.string(),
	SENDGRID_API_KEY: z.string(),
	SPOTIFY_CLIENT_ID: z.string(),
	SPOTIFY_CLIENT_SECRET: z.string(),
	TWILIO_ACCOUNT_SID: z.string(),
	TWILIO_AUTH_TOKEN: z.string(),
	TWILIO_PHONE_NUMBER: z.string(),
});

export function zEnv<TClient extends ZodRawShape, TServer extends ZodRawShape>({
	clientEnvSchema,
	serverEnvSchema,
}: {
	clientEnvSchema: z.ZodObject<TClient>;
	serverEnvSchema: z.ZodObject<TServer>;
}) {
	const isServer = typeof window === 'undefined';

	const merged = serverEnvSchema.merge(clientEnvSchema);
	const parsed = isServer
		? merged.safeParse(processEnv)
		: clientEnvSchema.safeParse(processEnv);

	if (!parsed?.success) {
		console.error(
			'❌ Invalid environment variables:\n',
			...formatErrors(parsed.error.format()),
		);
		throw new Error('Invalid environment variables');
	}

	const env = new Proxy(parsed.data, {
		get(target, prop) {
			if (typeof prop !== 'string') return undefined;
			if (!isServer && !prop.startsWith('NEXT_PUBLIC_'))
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

const formatErrors = (errors: z.ZodFormattedError<Map<string, string>, string>) =>
	Object.entries(errors)
		.map(([name, value]) => {
			if (value && '_errors' in value) return `${name}: ${value._errors.join(', ')}\n`;
		})
		.filter(Boolean);

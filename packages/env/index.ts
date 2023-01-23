import { z, ZodRawShape } from 'zod';

const processEnv = {
	// CLIENT
	NEXT_PUBLIC_APP_BASE_URL: process.env.NEXT_PUBLIC_APP_BASE_URL,
	NEXT_PUBLIC_APP_DEV_PORT: process.env.NEXT_PUBLIC_APP_DEV_PORT,
	NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY,

	// SERVER
	NODE_ENV: process.env.NODE_ENV,

	API_USER_ID: process.env.API_USER_ID,
	NEXTAUTH_URL: process.env.NEXTAUTH_URL,
	NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,

	DATABASE_URL: process.env.DATABASE_URL,
	DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
	DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
	MAGIC_SECRET_KEY: process.env.MAGIC_SECRET_KEY,
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
	NEXT_PUBLIC_APP_BASE_URL: z.string(),
	NEXT_PUBLIC_APP_DEV_PORT:
		process.env.NODE_ENV === 'development'
			? z.string().min(1)
			: z.string().min(1).optional(),
	NEXT_PUBLIC_WEB_DEV_PORT:
		process.env.NODE_ENV === 'development'
			? z.string().min(1)
			: z.string().min(1).optional(),
	NEXT_PUBLIC_LINK_DEV_PORT:
		process.env.NODE_ENV === 'development'
			? z.string().min(1)
			: z.string().min(1).optional(),
	NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY: z.string(),
});

export const serverEnvAllSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']),
	// INTERNAL
	API_USER_ID: z.string(),
	NEXTAUTH_URL: z.preprocess(
		// This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
		// Since NextAuth.js automatically uses the VERCEL_URL if present.
		str => process.env.VERCEL_URL ?? str,
		// VERCEL_URL doesn't include `https` so it cant be validated as a URL
		process.env.VERCEL ? z.string() : z.string().url(),
	),
	NEXTAUTH_SECRET:
		process.env.NODE_ENV === 'production'
			? z.string().min(1)
			: z.string().min(1).optional(),

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

	// console.log('processEnv => ', processEnv);
	// console.log('isServer => ', isServer);

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

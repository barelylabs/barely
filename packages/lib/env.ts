import { clientEnvAllSchema, serverEnvAllSchema, zEnv } from '@barely/env';

const serverEnvSchema = serverEnvAllSchema.pick({
	BOT_SPOTIFY_ACCOUNT_ID: true,
	NEXTAUTH_SECRET: true,
	OPENAI_API_KEY: true,
	PUSHER_APP_SECRET: true,
	SCREENING_PHONE_NUMBER: true,
	SPOTIFY_CLIENT_ID: true,
	SPOTIFY_CLIENT_SECRET: true,
	STRIPE_SECRET_KEY: true,
	TWILIO_ACCOUNT_SID: true,
	TWILIO_AUTH_TOKEN: true,
});

const clientEnvSchema = clientEnvAllSchema.pick({
	NEXT_PUBLIC_APP_BASE_URL: true,
	NEXT_PUBLIC_PUSHER_APP_ID: true,
	NEXT_PUBLIC_PUSHER_APP_KEY: true,
	NEXT_PUBLIC_PUSHER_APP_CLUSTER: true,
});

const env = zEnv({ serverEnvSchema, clientEnvSchema });

export default env;

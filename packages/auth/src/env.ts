import { clientEnvAllSchema, serverEnvAllSchema, zEnv } from '@barely/env';

const clientEnvSchema = clientEnvAllSchema.pick({});

const serverEnvSchema = serverEnvAllSchema.pick({
	NEXTAUTH_SECRET: true,
	DISCORD_CLIENT_ID: true,
	DISCORD_CLIENT_SECRET: true,
	SPOTIFY_CLIENT_ID: true,
	SPOTIFY_CLIENT_SECRET: true,
});

const env = zEnv({ serverEnvSchema, clientEnvSchema });

export default env;

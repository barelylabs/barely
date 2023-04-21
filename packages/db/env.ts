import { clientEnvAllSchema, serverEnvAllSchema, zEnv } from '@barely/env';

const serverEnvSchema = serverEnvAllSchema.pick({
	VERCEL_ENV: true,
	DATABASE_URL: true,
});

const clientEnvSchema = clientEnvAllSchema.pick({});

const env = zEnv({ serverEnvSchema, clientEnvSchema });

export default env;

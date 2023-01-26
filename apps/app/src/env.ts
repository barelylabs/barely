import { clientEnvAllSchema, serverEnvAllSchema, zEnv } from '@barely/env';

const serverEnvSchema = serverEnvAllSchema;

const clientEnvSchema = clientEnvAllSchema.pick({
	NEXT_PUBLIC_APP_BASE_URL: true,
	NEXT_PUBLIC_APP_DEV_PORT: true,
	NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: true,
});

const env = zEnv({ clientEnvSchema, serverEnvSchema });

export default env;

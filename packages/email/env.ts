import { clientEnvAllSchema, serverEnvAllSchema, zEnv } from '@barely/env';

const serverEnvSchema = serverEnvAllSchema.pick({
	POSTMARK_SERVER_API_TOKEN: true,
});

const clientEnvSchema = clientEnvAllSchema.pick({
	NEXT_PUBLIC_APP_BASE_URL: true,
});

const env = zEnv({ serverEnvSchema, clientEnvSchema });

export default env;

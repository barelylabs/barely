import { clientEnvAllSchema, serverEnvAllSchema, zEnv } from '@barely/env';

const serverEnvSchema = serverEnvAllSchema.pick({
	NODE_ENV: true,
	POSTMARK_SERVER_API_TOKEN: true,
});

const clientEnvSchema = clientEnvAllSchema.pick({});

const env = zEnv({ serverEnvSchema, clientEnvSchema });

export default env;

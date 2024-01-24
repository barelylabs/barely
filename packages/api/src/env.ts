import { clientEnvAllSchema, serverEnvAllSchema, zEnv } from '@barely/env';

const serverEnvSchema = serverEnvAllSchema.pick({
	NODE_ENV: true,
	OPENAI_ORG_ID: true,
	OPENAI_API_KEY: true,
});

const clientEnvSchema = clientEnvAllSchema.pick({});

const env = zEnv({ serverEnvSchema, clientEnvSchema });

export default env;

import { clientEnvAllSchema, serverEnvAllSchema, zEnv } from '@barely/env';

const clientEnvSchema = clientEnvAllSchema.pick({});

const serverEnvSchema = serverEnvAllSchema.pick({
	MAGIC_SECRET_KEY: true,
});

const env = zEnv({ serverEnvSchema, clientEnvSchema });

export default env;

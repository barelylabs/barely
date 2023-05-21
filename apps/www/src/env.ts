import { clientEnvAllSchema, serverEnvAllSchema, zEnv } from '@barely/env';

const serverEnvSchema = serverEnvAllSchema.pick({});
const clientEnvSchema = clientEnvAllSchema.pick({
	NEXT_PUBLIC_APP_BASE_URL: true,
	NEXT_PUBLIC_WEB_BASE_URL: true,
});

const env = zEnv({ clientEnvSchema, serverEnvSchema });

export default env;

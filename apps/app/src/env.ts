import { clientEnvAllSchema, serverEnvAllSchema, zEnv } from '@barely/env';

const serverEnvSchema = serverEnvAllSchema;
const clientEnvSchema = clientEnvAllSchema;

const env = zEnv({ clientEnvSchema, serverEnvSchema });

export default env;

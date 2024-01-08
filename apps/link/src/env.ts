import { allClientEnvSchema, allServerEnvSchema, zEnv } from '@barely/env';

const serverEnvSchema = allServerEnvSchema;
const clientEnvSchema = allClientEnvSchema;

const env = zEnv({ clientEnvSchema, serverEnvSchema });

export default env;

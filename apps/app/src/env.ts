import { allClientEnvSchema, allServerEnvSchema, zEnv } from '@barely/env';
import { z } from 'zod';

const serverEnvSchema = allServerEnvSchema;
const clientEnvSchema = allClientEnvSchema;

const env = zEnv({ clientEnvSchema, serverEnvSchema });

export const clientEnv = zEnv({
	clientEnvSchema: clientEnvSchema,
	serverEnvSchema: z.object({}),
});

export default env;

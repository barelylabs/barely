import { zEnv } from '@barely/utils';
import { envSchema } from '@barely/schema';

const env = zEnv({ env: process.env, schema: envSchema });

export default env;

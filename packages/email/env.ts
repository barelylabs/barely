import { allClientEnvKeys, zEnv } from '@barely/env';

export const { env } = zEnv({
	clientEnvKeys: allClientEnvKeys,
	serverEnvKeys: ['RESEND_API_KEY'],
});

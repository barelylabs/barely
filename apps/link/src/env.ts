import { zEnv } from '@barely/env';

export const { env } = zEnv({
	clientEnvKeys: ['NEXT_PUBLIC_LINK_BASE_URL', 'NEXT_PUBLIC_WWW_BASE_URL'],
	serverEnvKeys: [],
});

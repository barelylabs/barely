import type { Auth } from '@barely/auth';
import { getBaseUrl } from '@barely/utils';
import { customSessionClient, magicLinkClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
	baseURL: getBaseUrl('app'),
	plugins: [customSessionClient<Auth>(), magicLinkClient()],
});

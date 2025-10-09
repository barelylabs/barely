import type { Auth } from '@barely/auth';
import { getBaseUrl } from '@barely/utils';
import { customSessionClient, magicLinkClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import { authEnv } from '@barely/auth/env';

export const authClient = createAuthClient({
	baseURL: getBaseUrl(authEnv.NEXT_PUBLIC_CURRENT_APP),
	plugins: [customSessionClient<Auth>(), magicLinkClient()],
});

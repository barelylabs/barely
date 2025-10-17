import 'server-only';

import { cache } from 'react';
import { headers } from 'next/headers';
import { initAuth } from '@barely/auth';

import { authEnv } from '../env';
import { getBaseUrl } from './get-url';

const baseUrl = getBaseUrl(
	authEnv.NEXT_PUBLIC_CURRENT_APP === 'appInvoice' ? 'appInvoice'
	: authEnv.NEXT_PUBLIC_CURRENT_APP === 'appFm' ? 'appFm'
	: 'app',
);

export const auth = initAuth({
	baseUrl,
	secret: authEnv.AUTH_SECRET,
	productionUrl: `https://${authEnv.VERCEL_PROJECT_PRODUCTION_URL ?? 'app.barely.ai'}`,
});

export const getSession = cache(async () =>
	auth.api.getSession({ headers: await headers() }),
);

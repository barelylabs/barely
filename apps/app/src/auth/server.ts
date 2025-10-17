import 'server-only';

// import { cache } from 'react';
// import { headers } from 'next/headers';
// import { initAuth } from '@barely/auth';
// import { getBaseUrl } from '@barely/utils';

// import { appEnv } from '~/env';

// export const auth = initAuth({
// 	baseUrl: getBaseUrl(
// 		appEnv.NEXT_PUBLIC_CURRENT_APP === 'appInvoice' ? 'appInvoice'
// 		: appEnv.NEXT_PUBLIC_CURRENT_APP === 'appFm' ? 'appFm'
// 		: 'app',
// 	),
// 	secret: appEnv.AUTH_SECRET,
// 	productionUrl: `https://${appEnv.VERCEL_PROJECT_PRODUCTION_URL ?? 'app.barely.ai'}`,
// });

// export const getSession = cache(async () =>
// 	auth.api.getSession({ headers: await headers() }),
// );

export { auth, getSession } from '@barely/auth/app.server';

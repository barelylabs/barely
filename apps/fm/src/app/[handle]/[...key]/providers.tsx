'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { fmPageApi } from '@barely/lib/server/routes/fm-page/fm-page.api.react';
import { isDevelopment } from '@barely/lib/utils/environment';
import { getAbsoluteUrl } from '@barely/lib/utils/url';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink, loggerLink } from '@trpc/client';
import SuperJSON from 'superjson';

import { ThemeProvider } from '@barely/ui/elements/next-theme-provider';
import { WrapBalancerProvider } from '@barely/ui/elements/wrap-balancer';

const createQueryClient = () => new QueryClient();

let clientQueryClientSingleton: QueryClient | undefined = undefined;

const getQueryClient = () => {
	if (typeof window === 'undefined') {
		// Server: always create a new QueryClient
		return createQueryClient();
	} else {
		// Browser: use singleton pattern to keep the same query client
		return (clientQueryClientSingleton ??= createQueryClient());
	}
};

export function TRPCReactProvider(props: { children: ReactNode }) {
	const queryClient = getQueryClient();

	const { handle, key } = useParams();

	const trpcClient = useMemo(() => {
		const headers = new Headers();
		headers.set('x-trpc-source', 'nextjs-react-fm');
		headers.set('x-handle', typeof handle === 'string' ? handle : '');
		headers.set(
			'x-key',
			Array.isArray(key) ? key.join('/')
			: typeof key === 'string' ? key
			: '',
		);
		const preparedHeaders = Object.fromEntries(headers);

		const trpc = fmPageApi.createClient({
			links: [
				loggerLink({
					enabled: opts =>
						isDevelopment() ||
						(opts.direction === 'down' && opts.result instanceof Error),
				}),
				httpBatchLink({
					transformer: SuperJSON,
					url: getAbsoluteUrl('fm', 'api/trpc/fmPage'),
					headers: preparedHeaders,
				}),
			],
		});

		return trpc;
	}, [handle, key]);

	// const [trpcClient] = useState(() =>
	// 	fmPageApi.createClient({
	// 		links: [
	// 			loggerLink({
	// 				enabled: opts =>
	// 					process.env.NODE_ENV === 'development' ||
	// 					(opts.direction === 'down' && opts.result instanceof Error),
	// 			}),

	// 			// unstable_httpBatchStreamLink({
	// 			httpBatchLink({
	// 				transformer: SuperJSON,
	// 				url: getAbsoluteUrl('fm', 'api/trpc/fmPage'),
	// 				headers() {
	// 					const headers = new Headers();
	// 					headers.set('x-trpc-source', 'nextjs-react-fm');
	// 					return headers;
	// 				},
	// 			}),
	// 		],
	// 	}),
	// );

	return (
		<QueryClientProvider client={queryClient}>
			<fmPageApi.Provider client={trpcClient} queryClient={queryClient}>
				{props.children}
			</fmPageApi.Provider>
		</QueryClientProvider>
	);
}

export default function Providers(props: { children: ReactNode }) {
	return (
		<ThemeProvider attribute='class' defaultTheme='dark'>
			<WrapBalancerProvider>
				<TRPCReactProvider>{props.children}</TRPCReactProvider>
			</WrapBalancerProvider>
		</ThemeProvider>
	);
}

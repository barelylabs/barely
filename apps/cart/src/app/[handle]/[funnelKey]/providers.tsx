'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { api } from '@barely/lib/server/api/react';
import { getUrl } from '@barely/lib/utils/url';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { loggerLink, unstable_httpBatchStreamLink } from '@trpc/client';
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

	const [trpcClient] = useState(() =>
		api.createClient({
			links: [
				loggerLink({
					enabled: opts =>
						process.env.NODE_ENV === 'development' ||
						(opts.direction === 'down' && opts.result instanceof Error),
				}),

				unstable_httpBatchStreamLink({
					transformer: SuperJSON,
					url: getUrl('cart', 'api/edge'),
					headers() {
						const headers = new Headers();
						headers.set('x-trpc-source', 'nextjs-react-cart');
						return headers;
					},
				}),
			],
		}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<api.Provider client={trpcClient} queryClient={queryClient}>
				{props.children}
			</api.Provider>
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
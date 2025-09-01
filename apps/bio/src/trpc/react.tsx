'use client';

// ^-- to make sure we can mount the Provider from a server component
import type { BioRenderRouter } from '@barely/api/public/bio-render.router';
import type { QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import React, { useState } from 'react';
import { getAbsoluteUrl, isDevelopment } from '@barely/utils';
import { isServer, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createTRPCClient, httpBatchLink, loggerLink } from '@trpc/client';
import SuperJSON from 'superjson';

import { BioRenderTRPCProvider } from '@barely/api/public/bio-render.trpc.react';

import { makeQueryClient } from '~/trpc/query-client';

let browserQueryClient: QueryClient | undefined = undefined;

const getQueryClient = () => {
	if (isServer) {
		// Server: always make a new QueryClient
		return makeQueryClient();
	} else {
		// Browser: make a new query client if we don't already have one
		// This is very important, so we don't re-make a new client if React
		// suspends during the initial render. This may not be needed if we
		// have a suspense boundary BELOW the creation of the query client
		browserQueryClient ??= makeQueryClient();
		return browserQueryClient;
	}
};

export function TRPCReactProvider(props: { children: ReactNode }) {
	const queryClient = getQueryClient();

	const [trpcClient] = useState(() => {
		const trpc = createTRPCClient<BioRenderRouter>({
			links: [
				loggerLink({
					enabled: opts =>
						isDevelopment() ||
						(opts.direction === 'down' && opts.result instanceof Error),
				}),

				httpBatchLink({
					transformer: SuperJSON,
					url: getAbsoluteUrl('bio', 'api/trpc/bioRender'),
					headers() {
						const headers = new Headers();
						headers.set('x-trpc-source', 'nextjs-react-bio');
						return headers;
					},
					// fetch(url, options) {
					// 	return fetch(url, {
					// 		...options,
					// 		credentials: 'same-origin',
					// 	});
					// },
				}),
			],
		});

		return trpc;
	});

	return (
		<QueryClientProvider client={queryClient}>
			<BioRenderTRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
				{props.children}
				<ReactQueryDevtools buttonPosition='bottom-right' initialIsOpen={false} />
			</BioRenderTRPCProvider>
		</QueryClientProvider>
	);
}

'use client';

// ^-- to make sure we can mount the Provider from a server component
import type { AppRouter } from '@barely/api/app/app.router';
import type { QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import React, { useState } from 'react';
import { usePusherSocketId } from '@barely/hooks';
import { getAbsoluteUrl, isDevelopment } from '@barely/utils';
import { isServer, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createTRPCClient, httpBatchStreamLink, loggerLink } from '@trpc/client';
import { useAtomValue } from 'jotai';
import SuperJSON from 'superjson';

import { APP_ENDPOINTS } from '@barely/api/app/app.endpoints';
import { TRPCProvider } from '@barely/api/app/trpc.react';

import { pageSessionAtom } from '@barely/atoms/session';

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
	const pageSession = useAtomValue(pageSessionAtom);
	const pusherSocketId = usePusherSocketId();

	const queryClient = getQueryClient();

	const [trpcClient] = useState(() =>
		createTRPCClient<AppRouter>({
			links: [
				loggerLink({
					enabled: opts =>
						isDevelopment() ||
						(opts.direction === 'down' && opts.result instanceof Error),
				}),

				runtime => {
					const servers = Object.fromEntries(
						APP_ENDPOINTS.map(endpoint => [
							endpoint,
							httpBatchStreamLink({
								transformer: SuperJSON,
								url: getAbsoluteUrl('app', `api/trpc/${endpoint}`),
								headers() {
									const headers = new Headers();
									headers.set('x-trpc-source', 'nextjs-react');
									headers.set('x-page-session-id', pageSession.id);
									headers.set('x-pusher-socket-id', pusherSocketId);
									return headers;
								},
							})(runtime),
						]),
					);

					return ctx => {
						const pathParts = ctx.op.path.split('.');

						let path: string = ctx.op.path;
						let serverName: keyof typeof servers = '_app';

						if (pathParts[0] && pathParts[0] in servers) {
							const firstPart = pathParts.shift() as keyof typeof servers;
							path = pathParts.join('.');
							serverName = firstPart;
						}

						if (serverName === '_app') {
							console.log('you need to add the endpoint to the APP_ENDPOINTS array');
						}

						const link = servers[serverName];

						if (!link) {
							throw new Error(
								`Unknown endpoint: ${serverName}. Make sure the endpoint is defined in the appRouter`,
							);
						}

						return link({
							...ctx,
							op: {
								...ctx.op,
								path,
							},
						});
					};
				},
			],
		}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
				{props.children}
				<ReactQueryDevtools buttonPosition='bottom-right' initialIsOpen={false} />
			</TRPCProvider>
		</QueryClientProvider>
	);
}

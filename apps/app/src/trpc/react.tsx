'use client';

// ^-- to make sure we can mount the Provider from a server component
import type { AppRouter } from '@barely/server/api/router';
import type { QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import React, { useMemo } from 'react';
import { usePusherSocketId } from '@barely/lib/hooks/use-pusher';
import { getAbsoluteUrl } from '@barely/lib/utils/url';
import { TRPCProvider } from '@barely/server/api/react';
import { isServer, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createTRPCClient, httpBatchStreamLink, loggerLink } from '@trpc/client';
import { useAtomValue } from 'jotai';
import SuperJSON from 'superjson';

import { pageSessionAtom } from '@barely/atoms/session.atom';

import { isDevelopment } from '@barely/utils/environment';

import { makeQueryClient } from '~/trpc/query-client';

// export function makeQueryClient() {
// 	return new QueryClient({
// 		defaultOptions: {
// 			queries: {
// 				staleTime: 1000 * 60 * 5,
// 			},
// 		},
// 	});
// }

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

	const trpcClient = useMemo(() => {
		const headers = new Headers();
		headers.set('x-trpc-source', 'nextjs-react');
		headers.set('x-page-session-id', pageSession.id);
		headers.set('x-pusher-socket-id', pusherSocketId);
		const preparedHeaders = Object.fromEntries(headers);

		const trpc = createTRPCClient<AppRouter>({
			links: [
				loggerLink({
					enabled: opts =>
						isDevelopment() ||
						(opts.direction === 'down' && opts.result instanceof Error),
				}),

				runtime => {
					const servers = {
						// combined app router. if it hasn't been split off, it'll default to calling here
						edge: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/edge'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						// split off routers
						analyticsEndpoint: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/analyticsEndpoint'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						auth: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/auth'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						bio: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/bio'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						campaign: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/campaign'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						cart: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/cart'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						cartFunnel: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/cartFunnel'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						domain: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/domain'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						event: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/event'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						file: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/file'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						fm: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/fm'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						formResponse: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/formResponse'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						genre: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/genre'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						link: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/link'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						mixtape: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/mixtape'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						playlist: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/playlist'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						playlistPitchReview: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/playlistPitchReview'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						playlistPlacement: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/playlistPlacement'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						pressKit: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/pressKit'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						product: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/product'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						providerAccount: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/providerAccount'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						spotify: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/spotify'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						stat: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/stat'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						stripeConnect: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/stripeConnect'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						track: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/track'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						user: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/user'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						visitorSession: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/visitorSession'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						workspace: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/workspace'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						workspaceInvite: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/workspaceInvite'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						workspaceStripe: httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/workspaceStripe'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),
					};

					return ctx => {
						const pathParts = ctx.op.path.split('.');

						let path: string = ctx.op.path;
						let serverName: keyof typeof servers = 'edge';

						if (pathParts[0] && pathParts[0] in servers) {
							const firstPart = pathParts.shift() as keyof typeof servers;
							path = pathParts.join('.');
							serverName = firstPart;
						}

						const link = servers[serverName];

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
		});

		return trpc;
	}, [pageSession.id, pusherSocketId]);

	return (
		<QueryClientProvider client={queryClient}>
			<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
				{props.children}
				<ReactQueryDevtools buttonPosition='bottom-right' initialIsOpen={false} />
			</TRPCProvider>
		</QueryClientProvider>
	);
}

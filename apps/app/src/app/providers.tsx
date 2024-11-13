'use client';

import type { ReactNode } from 'react';
import React, { useMemo } from 'react';
import { usePusherSocketId } from '@barely/lib/hooks/use-pusher';
import { getAbsoluteUrl } from '@barely/lib/utils/url';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';
import { loggerLink, unstable_httpBatchStreamLink } from '@trpc/client';
import { Provider as JotaiProvider, useAtomValue } from 'jotai';
import SuperJSON from 'superjson';

import { api } from '@barely/api/react';

import { pageSessionAtom } from '@barely/atoms/session.atom';

import { useWorkspaceHandle } from '@barely/hooks/use-workspace';

import { ThemeProvider } from '@barely/ui/elements/next-theme-provider';
import { TooltipProvider } from '@barely/ui/elements/tooltip';

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
	const pageSession = useAtomValue(pageSessionAtom);
	const workspaceHandle = useWorkspaceHandle();
	const pusherSocketId = usePusherSocketId();

	const queryClient = getQueryClient();

	const trpcClient = useMemo(() => {
		const headers = new Headers();
		headers.set('x-trpc-source', 'nextjs-react');
		headers.set('x-page-session-id', pageSession.id);
		headers.set('x-pusher-socket-id', pusherSocketId ?? '');
		headers.set('x-workspace-handle', workspaceHandle ?? '');
		const preparedHeaders = Object.fromEntries(headers);

		const trpc = api.createClient({
			links: [
				loggerLink({
					enabled: opts =>
						process.env.NODE_ENV === 'development' ||
						(opts.direction === 'down' && opts.result instanceof Error),
				}),

				runtime => {
					const servers = {
						// combined app router. if it hasn't been split off, it'll default to calling here
						edge: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/edge'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						// split off routers
						analyticsEndpoint: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/analyticsEndpoint'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						auth: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/auth'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						bio: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/bio'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						campaign: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/campaign'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						cart: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/cart'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						cartFunnel: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/cartFunnel'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						domain: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/domain'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						event: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/event'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						file: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/file'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						fm: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/fm'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						formResponse: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/formResponse'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						genre: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/genre'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						link: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/link'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						mixtape: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/mixtape'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						playlist: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/playlist'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						playlistPitchReview: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/playlistPitchReview'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						playlistPlacement: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/playlistPlacement'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						pressKit: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/pressKit'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						product: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/product'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						providerAccount: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/providerAccount'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						spotify: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/spotify'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						stat: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/stat'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						stripeConnect: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/stripeConnect'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						track: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/track'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						user: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/user'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						visitorSession: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/visitorSession'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						workspace: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/workspace'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						workspaceInvite: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getAbsoluteUrl('app', 'api/trpc/workspaceInvite'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						workspaceStripe: unstable_httpBatchStreamLink({
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
	}, [workspaceHandle, pageSession.id, pusherSocketId]);

	return (
		<QueryClientProvider client={queryClient}>
			<api.Provider client={trpcClient} queryClient={queryClient}>
				<ReactQueryStreamedHydration transformer={SuperJSON}>
					{props.children}
				</ReactQueryStreamedHydration>
			</api.Provider>
		</QueryClientProvider>
	);
}

export default function Providers(props: { children: ReactNode; headers?: Headers }) {
	return (
		<ThemeProvider attribute='class' defaultTheme='system' enableSystem>
			<JotaiProvider>
				<TooltipProvider delayDuration={100}>
					<TRPCReactProvider>
						<>
							{props.children}
							<ReactQueryDevtools buttonPosition='bottom-right' initialIsOpen={false} />
						</>
					</TRPCReactProvider>
				</TooltipProvider>
			</JotaiProvider>
		</ThemeProvider>
	);
}

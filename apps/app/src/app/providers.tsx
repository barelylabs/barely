'use client';

import type { ReactNode } from 'react';
import React, { useMemo } from 'react';
import { usePusherSocketId } from '@barely/lib/hooks/use-pusher';
import { getUrl } from '@barely/lib/utils/url';
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
		console.log('updating trpc client');

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
						node: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getUrl('app', 'api/node'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),

						edge: unstable_httpBatchStreamLink({
							transformer: SuperJSON,
							url: getUrl('app', 'api/edge'),
							headers() {
								return preparedHeaders;
							},
						})(runtime),
					};

					return ctx => {
						const pathParts = ctx.op.path.split('.');

						let path: string = ctx.op.path;
						let serverName: keyof typeof servers = 'edge';

						if (pathParts[0] === 'node') {
							pathParts.shift();
							path = pathParts.join('.');
							serverName = 'node';
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
							<ReactQueryDevtools buttonPosition='bottom-left' initialIsOpen={false} />
						</>
					</TRPCReactProvider>
				</TooltipProvider>
			</JotaiProvider>
		</ThemeProvider>
	);
}

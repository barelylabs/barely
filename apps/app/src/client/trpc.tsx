'use client';

import React, { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { useAtomValue } from 'jotai';
import { createTRPCJotai } from 'jotai-trpc';

import { type EdgeRouterInputs, type EdgeRouterOutputs } from '@barely/api/edge.router';
import { type NodeRouterInputs, type NodeRouterOutputs } from '@barely/api/node.router';
import { type CombinedRouter } from '@barely/api/router';
import { transformer } from '@barely/api/transformer';
import { pageSessionAtom } from '@barely/atoms/session.atom';

import env from '~/env';

const api = createTRPCReact<CombinedRouter, unknown, 'ExperimentalSuspense'>({
	unstable_overrides: {
		useMutation: {
			async onSuccess(opts) {
				await opts.originalFn();
			},
		},
	},
});

const jotaiApi = createTRPCJotai<CombinedRouter>({
	transformer,
	links: [
		runtime => {
			// const pageSession = useAtomValue(pageSessionAtom);
			const servers = {
				node: httpBatchLink({
					url: `${env.NEXT_PUBLIC_APP_BASE_URL}/api/node`,
					headers() {
						return {
							'Content-Type': 'application/json',
							// 'x-page-session-id': pageSession.id,
						};
					},
				})(runtime),
				edge: httpBatchLink({
					url: `${env.NEXT_PUBLIC_APP_BASE_URL}/api/edge`,
					headers() {
						return {
							'Content-Type': 'application/json',
							// 'x-page-session-id': pageSession.id,
						};
					},
				})(runtime),
			};
			return ctx => {
				const { op } = ctx;
				const pathParts = op.path.split('.');

				const serverName = pathParts.shift() as string as keyof typeof servers;

				const path = pathParts.join('.');

				const link = servers[serverName];

				return link({
					...ctx,
					op: {
						...op,
						path,
					},
				});
			};
		},
	],
});

const TrpcProvider: React.FC<{ children: React.ReactNode }> = p => {
	const pageSession = useAtomValue(pageSessionAtom);

	const [TrpcQueryClient] = useState(() => new QueryClient());
	const [TrpcClient] = useState(() =>
		api.createClient({
			transformer,
			links: [
				runtime => {
					const servers = {
						node: httpBatchLink({
							url: `${env.NEXT_PUBLIC_APP_BASE_URL}/api/node`,
							headers() {
								return {
									'Content-Type': 'application/json',
									'x-page-session-id': pageSession.id,
								};
							},
						})(runtime),
						edge: httpBatchLink({
							url: `${env.NEXT_PUBLIC_APP_BASE_URL}/api/edge`,
							headers() {
								return {
									'Content-Type': 'application/json',
									'x-page-session-id': pageSession.id,
								};
							},
						})(runtime),
					};
					return ctx => {
						const { op } = ctx;
						const pathParts = op.path.split('.');

						const serverName = pathParts.shift() as string as keyof typeof servers;

						const path = pathParts.join('.');

						const link = servers[serverName];

						return link({
							...ctx,
							op: {
								...op,
								path,
							},
						});
					};
				},
			],
		}),
	);

	return (
		<api.Provider client={TrpcClient} queryClient={TrpcQueryClient}>
			<QueryClientProvider client={TrpcQueryClient}>{p.children}</QueryClientProvider>
		</api.Provider>
	);
};

export {
	api,
	jotaiApi,
	type NodeRouterInputs,
	type NodeRouterOutputs,
	type EdgeRouterInputs,
	type EdgeRouterOutputs,
	TrpcProvider,
};

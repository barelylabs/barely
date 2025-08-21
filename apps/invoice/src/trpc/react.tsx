'use client';

import type { InvoiceRenderRouter } from '@barely/api/public/invoice-render.router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import SuperJSON from 'superjson';

import {
	InvoiceRenderTRPCProvider,
	useInvoiceRenderTRPC,
} from '@barely/api/public/invoice-render.trpc.react';

import { getQueryClient } from './query-client';

export { useInvoiceRenderTRPC };

export function TRPCReactProvider({ children }: { children: ReactNode }) {
	const queryClient = getQueryClient();

	const [trpcClient] = useState(() =>
		createTRPCClient<InvoiceRenderRouter>({
			links: [
				httpBatchLink({
					url: `/api/trpc/invoiceRender`,
					transformer: SuperJSON,
				}),
			],
		}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<InvoiceRenderTRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
				{children}
				<ReactQueryDevtools />
			</InvoiceRenderTRPCProvider>
		</QueryClientProvider>
	);
}

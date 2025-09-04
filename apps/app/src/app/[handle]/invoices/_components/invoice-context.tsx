'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import {
	action,
	createResourceDataHook,
	createResourceSearchParamsHook,
} from '@barely/hooks';
import { parseAsString, parseAsStringEnum } from 'nuqs';

import { useTRPC } from '@barely/api/app/trpc.react';

// Define the page data type for invoices
interface InvoicePageData {
	invoices: AppRouterOutputs['invoice']['byWorkspace']['invoices'];
	nextCursor?: { id: string; createdAt: Date } | null;
}

// Create the search params hook for invoices
export const useInvoiceSearchParams = createResourceSearchParamsHook({
	additionalParsers: {
		status: parseAsStringEnum(['draft', 'sent', 'viewed', 'paid', 'overdue', 'voided']),
		clientId: parseAsString,
	},
	additionalActions: {
		setStatus: action((setParams, status: string | undefined) => setParams({ status })),
		setClientId: action((setParams, clientId: string | undefined) =>
			setParams({ clientId }),
		),
	},
});

// Create a custom data hook for invoices that properly uses tRPC
export function useInvoice() {
	const trpc = useTRPC();
	const searchParams = useInvoiceSearchParams();
	const baseHook = createResourceDataHook<
		AppRouterOutputs['invoice']['byWorkspace']['invoices'][0],
		InvoicePageData
	>(
		{
			resourceName: 'invoices',
			getQueryOptions: (handle, filters) =>
				trpc.invoice.byWorkspace.infiniteQueryOptions(
					{ handle, ...filters },
					{ getNextPageParam: (lastPage: InvoicePageData) => lastPage.nextCursor },
				),
			getItemsFromPages: pages => pages.flatMap(page => page.invoices),
		},
		() => searchParams,
	);

	const dataHookResult = baseHook();

	// Merge search params and data hook results
	return {
		...dataHookResult,
		...searchParams,
	};
}

// Export the old context hook name for backward compatibility
export const useInvoiceContext = useInvoice;

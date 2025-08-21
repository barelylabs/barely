'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import {
	action,
	createResourceDataHook,
	createResourceSearchParamsHook,
} from '@barely/hooks';
import { parseAsStringEnum } from 'nuqs';

import { useTRPC } from '@barely/api/app/trpc.react';

// Define the page data type for invoices
interface InvoicePageData {
	invoices: AppRouterOutputs['invoice']['byWorkspace']['invoices'];
	nextCursor?: { id: string; createdAt: Date } | null;
}

// Create the search params hook for invoices
export const useInvoiceSearchParams = createResourceSearchParamsHook({
	additionalParsers: {
		status: parseAsStringEnum([
			'draft',
			'sent',
			'viewed',
			'paid',
			'overdue',
			'voided',
		]).withDefault('all'),
		clientId: parseAsStringEnum([]).withDefault('all'),
	},
	additionalActions: {
		setStatus: action((setParams, status: string) => setParams({ status })),
		setClientId: action((setParams, clientId: string) => setParams({ clientId })),
	},
});

// Create a custom data hook for invoices that properly uses tRPC
export function useInvoice() {
	const trpc = useTRPC();
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
		useInvoiceSearchParams,
	);

	return baseHook();
}

// Export the old context hook name for backward compatibility
export const useInvoiceContext = useInvoice;

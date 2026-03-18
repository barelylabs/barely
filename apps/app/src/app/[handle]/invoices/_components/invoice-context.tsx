'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { useMemo, useRef } from 'react';
import { action, createResourceSearchParamsHook, useFocusGridList } from '@barely/hooks';
import { parseAsString, parseAsStringEnum } from 'nuqs';

import type { InvoiceClientSync, InvoiceWithClient } from '~/collections';
import { useInvoicesLiveQuery } from '~/collections';

// Define the page data type for invoices (for backward compatibility)
type InvoiceFromApi = AppRouterOutputs['invoice']['byWorkspace']['invoices'][0];

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

/**
 * Map Electric sync data to the existing API format for UI components
 */
function mapToApiFormat(invoice: InvoiceWithClient): InvoiceFromApi {
	return {
		id: invoice.id,
		workspaceId: invoice.workspaceId,
		// Invoice identifiers
		invoiceNumber: invoice.invoiceNumber,
		clientId: invoice.clientId,
		// Invoice details
		lineItems: invoice.lineItems as InvoiceFromApi['lineItems'],
		tax: invoice.tax,
		subtotal: invoice.subtotal,
		total: invoice.total,
		poNumber: invoice.poNumber,
		payerMemo: invoice.payerMemo,
		notes: invoice.notes,
		// Dates and status
		dueDate: new Date(invoice.dueDate),
		status: invoice.status as InvoiceFromApi['status'],
		// Payment tracking
		stripePaymentIntentId: invoice.stripePaymentIntentId,
		// Recurring invoice fields
		subscriptionId: invoice.subscriptionId,
		billingInterval: invoice.billingInterval as InvoiceFromApi['billingInterval'],
		type: invoice.type as InvoiceFromApi['type'],
		recurringDiscountPercent: invoice.recurringDiscountPercent,
		// Email tracking
		lastResendId: invoice.lastResendId,
		// Activity tracking
		sentAt: invoice.sentAt ? new Date(invoice.sentAt) : null,
		viewedAt: invoice.viewedAt ? new Date(invoice.viewedAt) : null,
		paidAt: invoice.paidAt ? new Date(invoice.paidAt) : null,
		// Map timestamps from string to Date
		createdAt: new Date(invoice.created_at),
		updatedAt: new Date(invoice.updated_at),
		deletedAt: invoice.deleted_at ? new Date(invoice.deleted_at) : null,
		archivedAt: invoice.archived_at ? new Date(invoice.archived_at) : null,
		// Client relation
		client: invoice.client ? mapClientToApiFormat(invoice.client) : null,
	} as InvoiceFromApi;
}

function mapClientToApiFormat(
	client: InvoiceClientSync,
): NonNullable<InvoiceFromApi['client']> {
	return {
		id: client.id,
		workspaceId: client.workspaceId,
		name: client.name,
		email: client.email,
		company: client.company,
		address: client.address,
		country: client.country,
		addressLine1: client.addressLine1,
		addressLine2: client.addressLine2,
		city: client.city,
		state: client.state,
		postalCode: client.postalCode,
		stripeCustomerId: client.stripeCustomerId,
		createdAt: new Date(client.created_at),
		updatedAt: new Date(client.updated_at),
		deletedAt: client.deleted_at ? new Date(client.deleted_at) : null,
		archivedAt: client.archived_at ? new Date(client.archived_at) : null,
	} as NonNullable<InvoiceFromApi['client']>;
}

/**
 * Main hook for Invoices - uses Electric SQL live query for real-time data
 */
export function useInvoice() {
	const searchParams = useInvoiceSearchParams();
	const {
		data: invoices,
		isLoading,
		isEnabled,
	} = useInvoicesLiveQuery({
		showArchived: searchParams.filters.showArchived,
		status: searchParams.filters.status,
		clientId: searchParams.filters.clientId,
	});

	// Grid list ref for focus management
	const gridListRef = useRef<HTMLDivElement | null>(null);
	const focusGridList = useFocusGridList('invoices');

	// Map and filter data
	const items = useMemo(() => {
		if (!invoices) return [];

		let filtered = invoices;

		// Apply search filter (by invoice number)
		const search = searchParams.filters.search.toLowerCase();
		if (search) {
			filtered = filtered.filter(invoice =>
				invoice.invoiceNumber.toLowerCase().includes(search),
			);
		}

		// Map to API format
		return filtered.map(mapToApiFormat);
	}, [invoices, searchParams.filters.search]);

	// Compute last selected item
	const selectedIds = searchParams.selectedIds;
	const lastSelectedItemId = useMemo(() => {
		if (selectedIds === 'all') return items[0]?.id;
		if (Array.isArray(selectedIds) && selectedIds.length > 0) {
			return selectedIds[selectedIds.length - 1];
		}
		return undefined;
	}, [selectedIds, items]);

	const lastSelectedItem = useMemo(() => {
		if (!lastSelectedItemId) return undefined;
		return items.find(item => item.id === lastSelectedItemId);
	}, [lastSelectedItemId, items]);

	return {
		// Data
		items,
		// Selection
		lastSelectedItemId,
		lastSelectedItem,
		// Loading states
		isFetching: isLoading,
		isFetchingNextPage: false,
		isRefetching: false,
		isPending: !isEnabled,
		hasNextPage: false, // Electric syncs all data, no pagination
		// Fetch functions (no-ops for Electric)
		fetchNextPage: () => Promise.resolve(),
		refetch: () => Promise.resolve(),
		// Grid list
		gridListRef,
		focusGridList,
		// Search params
		...searchParams,
	};
}

// Export the old context hook name for backward compatibility
export const useInvoiceContext = useInvoice;

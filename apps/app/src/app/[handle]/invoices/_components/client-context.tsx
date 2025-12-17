'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { useMemo, useRef } from 'react';
import { createResourceSearchParamsHook, useFocusGridList } from '@barely/hooks';

import type { InvoiceClientSync } from '~/collections';
import { useInvoiceClientsLiveQuery } from '~/collections';

// Define the page data type for clients (for backward compatibility)
type ClientFromApi = AppRouterOutputs['invoiceClient']['byWorkspace']['clients'][0];

// Create the search params hook for clients
export const useClientSearchParams = createResourceSearchParamsHook({});

/**
 * Map Electric sync data to the existing API format for UI components
 */
function mapToApiFormat(client: InvoiceClientSync): ClientFromApi {
	return {
		id: client.id,
		workspaceId: client.workspaceId,
		// Client information
		name: client.name,
		email: client.email,
		company: client.company,
		address: client.address,
		// Address fields
		country: client.country,
		addressLine1: client.addressLine1,
		addressLine2: client.addressLine2,
		city: client.city,
		state: client.state,
		postalCode: client.postalCode,
		// Stripe
		stripeCustomerId: client.stripeCustomerId,
		// Timestamps
		createdAt: new Date(client.created_at),
		updatedAt: new Date(client.updated_at),
		deletedAt: client.deleted_at ? new Date(client.deleted_at) : null,
		archivedAt: client.archived_at ? new Date(client.archived_at) : null,
	};
}

/**
 * Main hook for Invoice Clients - uses Electric SQL live query for real-time data
 */
export function useClient() {
	const searchParams = useClientSearchParams();
	const {
		data: clients,
		isLoading,
		isEnabled,
	} = useInvoiceClientsLiveQuery({
		showArchived: searchParams.filters.showArchived,
	});

	// Grid list ref for focus management
	const gridListRef = useRef<HTMLDivElement | null>(null);
	const focusGridList = useFocusGridList('clients');

	// Map and filter data
	const items = useMemo(() => {
		if (!clients) return [];

		let filtered = clients;

		// Apply search filter (by name, email, or company)
		const search = searchParams.filters.search.toLowerCase();
		if (search) {
			filtered = filtered.filter(
				client =>
					client.name.toLowerCase().includes(search) ||
					client.email.toLowerCase().includes(search) ||
					client.company?.toLowerCase().includes(search),
			);
		}

		// Map to API format
		return filtered.map(mapToApiFormat);
	}, [clients, searchParams.filters.search]);

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
export const useClientContext = useClient;

'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { useMemo, useRef } from 'react';
import { createResourceSearchParamsHook, useFocusGridList } from '@barely/hooks';

import type { EmailAddressWithDomain } from '~/collections';
import { useEmailAddressesLiveQuery } from '~/collections';

// Define the page data type for email addresses (for backward compatibility)
type EmailAddressFromApi =
	AppRouterOutputs['emailAddress']['byWorkspace']['emailAddresses'][0];

// Type for addresses that have a domain (required for mapping to API format)
type EmailAddressWithRequiredDomain = EmailAddressWithDomain & {
	domain: NonNullable<EmailAddressWithDomain['domain']>;
};

// Type guard to filter addresses with domain
function hasRequiredDomain(
	address: EmailAddressWithDomain,
): address is EmailAddressWithRequiredDomain {
	return address.domain !== null;
}

// Create the search params hook for email addresses
export const useEmailAddressSearchParams = createResourceSearchParamsHook({});

/**
 * Map Electric sync data to the existing API format for UI components
 * Note: Only call this with addresses that have a domain (use hasRequiredDomain filter first)
 */
function mapToApiFormat(address: EmailAddressWithRequiredDomain): EmailAddressFromApi {
	return {
		id: address.id,
		workspaceId: address.workspaceId,
		// Address info
		email: `${address.username}@${address.domain.domain}`,
		username: address.username,
		domainId: address.domainId,
		replyTo: address.replyTo,
		defaultFriendlyName: address.defaultFriendlyName,
		default: address.default,
		// Timestamps
		createdAt: new Date(address.created_at),
		updatedAt: new Date(address.updated_at),
		deletedAt: address.deleted_at ? new Date(address.deleted_at) : null,
		archivedAt: address.archived_at ? new Date(address.archived_at) : null,
		// Domain relation (now guaranteed to exist)
		domain: {
			id: address.domain.id,
			workspaceId: address.domain.workspaceId,
			name: address.domain.domain,
			region: address.domain.region as EmailAddressFromApi['domain']['region'],
			resendId: address.domain.resendId,
			status: address.domain.status as EmailAddressFromApi['domain']['status'],
			records: (address.domain.records ?? []) as EmailAddressFromApi['domain']['records'],
			clickTracking: address.domain.clickTracking,
			openTracking: address.domain.openTracking,
			createdAt: new Date(address.domain.created_at),
			updatedAt: new Date(address.domain.updated_at),
			deletedAt: address.domain.deleted_at ? new Date(address.domain.deleted_at) : null,
			archivedAt:
				address.domain.archived_at ? new Date(address.domain.archived_at) : null,
		},
	};
}

/**
 * Main hook for Email Addresses - uses Electric SQL live query for real-time data
 */
export function useEmailAddress() {
	const searchParams = useEmailAddressSearchParams();
	const {
		data: addresses,
		isLoading,
		isEnabled,
	} = useEmailAddressesLiveQuery({
		showArchived: searchParams.filters.showArchived,
	});

	// Grid list ref for focus management
	const gridListRef = useRef<HTMLDivElement | null>(null);
	const focusGridList = useFocusGridList('email-addresses');

	// Map and filter data
	const items = useMemo(() => {
		if (!addresses) return [];

		let filtered = addresses;

		// Apply search filter (by username or domain name)
		const search = searchParams.filters.search.toLowerCase();
		if (search) {
			filtered = filtered.filter(
				address =>
					address.username.toLowerCase().includes(search) ||
					address.domain?.domain.toLowerCase().includes(search),
			);
		}

		// Map to API format (filter out addresses without domain first)
		return filtered.filter(hasRequiredDomain).map(mapToApiFormat);
	}, [addresses, searchParams.filters.search]);

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
export const useEmailAddressContext = useEmailAddress;

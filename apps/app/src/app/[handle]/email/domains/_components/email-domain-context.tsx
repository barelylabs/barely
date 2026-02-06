'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { useMemo, useRef } from 'react';
import { createResourceSearchParamsHook, useFocusGridList } from '@barely/hooks';

import type { EmailDomainSync } from '~/collections';
import { useEmailDomainsLiveQuery } from '~/collections';

// Define the page data type for email domains (for backward compatibility)
type EmailDomainFromApi = AppRouterOutputs['emailDomain']['byWorkspace']['domains'][0];

// Create the search params hook for email domains
export const useEmailDomainSearchParams = createResourceSearchParamsHook({});

/**
 * Map Electric sync data to the existing API format for UI components
 */
function mapToApiFormat(domain: EmailDomainSync): EmailDomainFromApi {
	return {
		id: domain.id,
		workspaceId: domain.workspaceId,
		// Domain info (note: Electric uses 'domain' column, API expects 'name')
		name: domain.domain,
		region: domain.region as EmailDomainFromApi['region'],
		// Resend integration
		resendId: domain.resendId,
		status: domain.status as EmailDomainFromApi['status'],
		records: (domain.records ?? []) as EmailDomainFromApi['records'],
		// Tracking settings
		clickTracking: domain.clickTracking,
		openTracking: domain.openTracking,
		// Timestamps
		createdAt: new Date(domain.created_at),
		updatedAt: new Date(domain.updated_at),
		deletedAt: domain.deleted_at ? new Date(domain.deleted_at) : null,
		archivedAt: domain.archived_at ? new Date(domain.archived_at) : null,
	};
}

/**
 * Main hook for Email Domains - uses Electric SQL live query for real-time data
 */
export function useEmailDomain() {
	const searchParams = useEmailDomainSearchParams();
	const {
		data: domains,
		isLoading,
		isEnabled,
	} = useEmailDomainsLiveQuery({
		showArchived: searchParams.filters.showArchived,
	});

	// Grid list ref for focus management
	const gridListRef = useRef<HTMLDivElement | null>(null);
	const focusGridList = useFocusGridList('email-domains');

	// Map and filter data
	const items = useMemo(() => {
		if (!domains) return [];

		let filtered = domains;

		// Apply search filter (by domain name)
		const search = searchParams.filters.search.toLowerCase();
		if (search) {
			filtered = filtered.filter(domain => domain.domain.toLowerCase().includes(search));
		}

		// Map to API format
		return filtered.map(mapToApiFormat);
	}, [domains, searchParams.filters.search]);

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
export const useEmailDomainContext = useEmailDomain;

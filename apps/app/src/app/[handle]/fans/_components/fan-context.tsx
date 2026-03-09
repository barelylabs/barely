'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { useMemo, useRef } from 'react';
import { action, createResourceSearchParamsHook, useFocusGridList } from '@barely/hooks';
import { parseAsBoolean } from 'nuqs';

import type { FanSync } from '~/collections';
import { useFansLiveQuery } from '~/collections';

// Define the page data type for fans (for backward compatibility)
type FanFromApi = AppRouterOutputs['fan']['byWorkspace']['fans'][0];

// Create the search params hook for fans with import/export modal state
export const useFanSearchParams = createResourceSearchParamsHook({
	additionalParsers: {
		showImportModal: parseAsBoolean.withDefault(false),
		showExportModal: parseAsBoolean.withDefault(false),
	},
	additionalActions: {
		setShowImportModal: action((setParams, show: boolean) =>
			setParams({ showImportModal: show }),
		),
		setShowExportModal: action((setParams, show: boolean) =>
			setParams({ showExportModal: show }),
		),
	},
});

/**
 * Map Electric sync data to the existing API format for UI components
 */
function mapToApiFormat(fan: FanSync): FanFromApi {
	return {
		id: fan.id,
		workspaceId: fan.workspaceId,
		// Marketing opt-ins
		emailMarketingOptIn: fan.emailMarketingOptIn,
		smsMarketingOptIn: fan.smsMarketingOptIn,
		// Contact info
		firstName: fan.firstName,
		lastName: fan.lastName,
		fullName: fan.fullName,
		email: fan.email,
		phoneNumber: fan.phoneNumber,
		appReferer: fan.appReferer as FanFromApi['appReferer'],
		// Shipping address
		shippingAddressLine1: fan.shippingAddressLine1,
		shippingAddressLine2: fan.shippingAddressLine2,
		shippingAddressCity: fan.shippingAddressCity,
		shippingAddressState: fan.shippingAddressState,
		shippingAddressCountry: fan.shippingAddressCountry,
		shippingAddressPostalCode: fan.shippingAddressPostalCode,
		// Billing address
		billingAddressPostalCode: fan.billingAddressPostalCode,
		billingAddressCountry: fan.billingAddressCountry,
		// Stripe
		stripeCustomerId: fan.stripeCustomerId,
		stripePaymentMethodId: fan.stripePaymentMethodId,
		// Timestamps (convert from Electric string format to Date)
		createdAt: new Date(fan.created_at),
		updatedAt: new Date(fan.updated_at),
		deletedAt: fan.deleted_at ? new Date(fan.deleted_at) : null,
		archivedAt: fan.archived_at ? new Date(fan.archived_at) : null,
	};
}

/**
 * Main hook for Fans - uses Electric SQL live query for real-time data
 */
export function useFan() {
	const searchParams = useFanSearchParams();
	const {
		data: fans,
		isLoading,
		isEnabled,
	} = useFansLiveQuery({
		showArchived: searchParams.filters.showArchived,
	});

	// Grid list ref for focus management
	const gridListRef = useRef<HTMLDivElement | null>(null);
	const focusGridList = useFocusGridList('fans');

	// Map and filter data
	const items = useMemo(() => {
		if (!fans) return [];

		let filtered = fans;

		// Apply search filter (by fullName or email)
		const search = searchParams.filters.search.toLowerCase();
		if (search) {
			filtered = filtered.filter(
				fan =>
					fan.fullName.toLowerCase().includes(search) ||
					fan.email.toLowerCase().includes(search),
			);
		}

		// Map to API format
		return filtered.map(mapToApiFormat);
	}, [fans, searchParams.filters.search]);

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
export const useFanContext = useFan;

'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { useMemo, useRef } from 'react';
import { createResourceSearchParamsHook, useFocusGridList } from '@barely/hooks';

import type { ImageFileSync, VipSwapWithCoverImage } from '~/collections';
import { useVipSwapsLiveQuery } from '~/collections';

// Define the page data type for vip swaps (for backward compatibility)
type VipSwapFromApi = AppRouterOutputs['vipSwap']['byWorkspace']['vipSwaps'][0];

// Create the search params hook for vip pages
export const useVipSwapsSearchParams = createResourceSearchParamsHook();

/**
 * Cover image data for VIP Swap listing (subset of full File type)
 */
interface VipSwapCoverImage {
	id: string;
	workspaceId: string;
	type: string;
	s3Key: string;
	src: string | null;
	width: number | null;
	height: number | null;
	blurDataUrl: string | null;
	createdAt: Date;
	deletedAt: Date | null;
}

/**
 * Type for VIP Swap listing data (subset of full API type)
 * Note: file and accessLogs are not synced via Electric - they're loaded via byId when needed
 */
export type VipSwapListItem = Omit<
	VipSwapFromApi,
	'file' | 'accessLogs' | 'coverImage'
> & {
	file: null;
	accessLogs: [];
	coverImage: VipSwapCoverImage | null;
};

/**
 * Map Electric sync data to the existing API format for UI components
 */
function mapToApiFormat(vipSwap: VipSwapWithCoverImage): VipSwapListItem {
	return {
		id: vipSwap.id,
		workspaceId: vipSwap.workspaceId,
		handle: vipSwap.handle,
		// Basic info
		name: vipSwap.name,
		key: vipSwap.key,
		type: vipSwap.type as VipSwapFromApi['type'],
		description: vipSwap.description,
		// Files
		fileId: vipSwap.fileId,
		coverImageId: vipSwap.coverImageId,
		// Email capture settings
		emailCaptureTitle: vipSwap.emailCaptureTitle,
		emailCaptureDescription: vipSwap.emailCaptureDescription,
		emailCaptureLabel: vipSwap.emailCaptureLabel,
		// Download page settings
		downloadTitle: vipSwap.downloadTitle,
		// Email settings
		emailFromName: vipSwap.emailFromName,
		emailSubject: vipSwap.emailSubject,
		emailBody: vipSwap.emailBody,
		// Status
		isActive: vipSwap.isActive,
		expiresAt: vipSwap.expiresAt ? new Date(vipSwap.expiresAt) : null,
		// Stats
		downloadCount: vipSwap.downloadCount,
		emailCount: vipSwap.emailCount,
		pageViewCount: vipSwap.pageViewCount,
		// Attribution
		cartProductId: vipSwap.cartProductId,
		marketingCampaignId: vipSwap.marketingCampaignId,
		// Security
		downloadLimit: vipSwap.downloadLimit,
		passwordProtected: vipSwap.passwordProtected,
		password: vipSwap.password,
		downloadLinkExpiryMinutes: vipSwap.downloadLinkExpiryMinutes,
		// Map timestamps from string to Date
		createdAt: new Date(vipSwap.created_at),
		updatedAt: new Date(vipSwap.updated_at),
		deletedAt: vipSwap.deleted_at ? new Date(vipSwap.deleted_at) : null,
		archivedAt: vipSwap.archived_at ? new Date(vipSwap.archived_at) : null,
		// Cover image relation (mapped with necessary fields for listing)
		coverImage: vipSwap.coverImage ? mapImageToApiFormat(vipSwap.coverImage) : null,
		// File relation (not synced, will be null - loaded via byId when needed)
		file: null,
		// Access logs (not synced, will be empty - loaded via byId when needed)
		accessLogs: [],
	};
}

function mapImageToApiFormat(image: ImageFileSync): VipSwapCoverImage {
	return {
		id: image.id,
		workspaceId: image.workspaceId,
		type: image.type,
		s3Key: image.key, // In the API, s3Key is the same as key
		src: image.src,
		width: image.width,
		height: image.height,
		blurDataUrl: image.blurDataUrl,
		createdAt: new Date(image.created_at),
		deletedAt: image.deleted_at ? new Date(image.deleted_at) : null,
	};
}

/**
 * Main hook for VIP Swaps - uses Electric SQL live query for real-time data
 */
export function useVipSwaps() {
	const searchParams = useVipSwapsSearchParams();
	const {
		data: vipSwaps,
		isLoading,
		isEnabled,
	} = useVipSwapsLiveQuery({
		showArchived: searchParams.filters.showArchived,
	});

	// Grid list ref for focus management
	const gridListRef = useRef<HTMLDivElement | null>(null);
	const focusGridList = useFocusGridList('vip-swaps');

	// Map and filter data
	const items = useMemo(() => {
		if (!vipSwaps) return [];

		let filtered = vipSwaps;

		// Apply search filter (by name)
		const search = searchParams.filters.search.toLowerCase();
		if (search) {
			filtered = filtered.filter(vipSwap => vipSwap.name.toLowerCase().includes(search));
		}

		// Map to API format
		return filtered.map(mapToApiFormat);
	}, [vipSwaps, searchParams.filters.search]);

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

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { useLiveQuery } from '@tanstack/react-db';

import type { ImageFileSync } from './image-files.collection';
import type { VipSwapSync } from './vip-swaps.collection';
import { useImageFilesCollection } from './image-files.collection';
import { useVipSwapsCollection } from './vip-swaps.collection';

export type VipSwapWithCoverImage = VipSwapSync & {
	coverImage: ImageFileSync | null;
};

interface UseVipSwapsLiveQueryOptions {
	showArchived?: boolean;
}

interface UseVipSwapsLiveQueryResult {
	data: VipSwapWithCoverImage[] | undefined;
	isLoading: boolean;
	isEnabled: boolean;
}

/**
 * Hook to query VipSwaps with their cover images using TanStack DB live queries.
 * Handles SSR, collection readiness, and client-side joins VipSwaps with ImageFiles.
 */
export function useVipSwapsLiveQuery(
	options: UseVipSwapsLiveQueryOptions = {},
): UseVipSwapsLiveQueryResult {
	const { showArchived = false } = options;
	const { workspace } = useWorkspace();

	// Track client-side rendering
	const [isClient, setIsClient] = useState(false);
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Get collections
	const vipSwapsCollection = useVipSwapsCollection();
	const imageFilesCollection = useImageFilesCollection();

	// Determine if we can query
	const hasValidCollections = !!vipSwapsCollection && !!imageFilesCollection;
	const shouldQuery = isClient && hasValidCollections;

	// Query VipSwaps using the query builder syntax
	const vipSwapsQueryResult = useLiveQuery(
		q => {
			if (!shouldQuery) return undefined;
			return q.from({ vipSwaps: vipSwapsCollection });
		},
		[shouldQuery, vipSwapsCollection],
	);

	// Query ImageFiles using the query builder syntax
	const imageFilesQueryResult = useLiveQuery(
		q => {
			if (!shouldQuery) return undefined;
			return q.from({ imageFiles: imageFilesCollection });
		},
		[shouldQuery, imageFilesCollection],
	);

	// Debug logging
	useEffect(() => {
		console.log('[VipSwaps Live Query] State:', {
			isClient,
			hasValidCollections,
			shouldQuery,
			workspaceId: workspace.id,
			showArchived,
			vipSwapsStatus: vipSwapsQueryResult.status,
			vipSwapsDataLength: vipSwapsQueryResult.data?.length ?? 0,
			imageFilesStatus: imageFilesQueryResult.status,
			imageFilesDataLength: imageFilesQueryResult.data?.length ?? 0,
		});
	}, [
		isClient,
		hasValidCollections,
		shouldQuery,
		workspace.id,
		showArchived,
		vipSwapsQueryResult.status,
		vipSwapsQueryResult.data?.length,
		imageFilesQueryResult.status,
		imageFilesQueryResult.data?.length,
	]);

	// Join VipSwaps with ImageFiles client-side
	const data = useMemo(() => {
		if (!vipSwapsQueryResult.data) return undefined;

		// Data from q.from({ alias: collection }) returns the raw items
		const vipSwaps = vipSwapsQueryResult.data as VipSwapSync[];
		const imageFiles = (imageFilesQueryResult.data as ImageFileSync[] | undefined) ?? [];

		// Create a map of image files by ID for fast lookup
		const imagesById = new Map(imageFiles.map(img => [img.id, img]));

		// Filter and join
		return vipSwaps
			.filter(vipSwap => {
				// Filter by workspace
				if (vipSwap.workspaceId !== workspace.id) return false;

				// Filter archived items (unless showing archived)
				if (!showArchived && vipSwap.archived_at !== null) return false;

				return true;
			})
			.map(vipSwap => ({
				...vipSwap,
				coverImage:
					vipSwap.coverImageId ? (imagesById.get(vipSwap.coverImageId) ?? null) : null,
			}))
			.sort(
				(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
			);
	}, [vipSwapsQueryResult.data, imageFilesQueryResult.data, workspace.id, showArchived]);

	// Return loading state if not ready
	if (!shouldQuery) {
		return {
			data: undefined,
			isLoading: true,
			isEnabled: false,
		};
	}

	const isLoading =
		vipSwapsQueryResult.status === 'loading' ||
		imageFilesQueryResult.status === 'loading';

	return {
		data,
		isLoading,
		isEnabled: true,
	};
}

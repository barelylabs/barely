'use client';

import type { FmPageSync } from './fm-pages.collection';
import type { ImageFileSync } from './image-files.collection';
import { useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { useLiveQuery } from '@tanstack/react-db';

import { useFmPagesCollection } from './fm-pages.collection';
import { useImageFilesCollection } from './image-files.collection';

export type FmPageWithCoverArt = FmPageSync & {
	coverArt: ImageFileSync | null;
};

interface UseFmPagesLiveQueryOptions {
	showArchived?: boolean;
}

interface UseFmPagesLiveQueryResult {
	data: FmPageWithCoverArt[] | undefined;
	isLoading: boolean;
	isEnabled: boolean;
}

/**
 * Hook to query FM pages with their cover art using TanStack DB live queries.
 * Handles SSR, collection readiness, and client-side joins FM pages with image files.
 */
export function useFmPagesLiveQuery(
	options: UseFmPagesLiveQueryOptions = {},
): UseFmPagesLiveQueryResult {
	const { showArchived = false } = options;
	const { workspace } = useWorkspace();

	// Track client-side rendering
	const [isClient, setIsClient] = useState(false);
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Get collections
	const fmPagesCollection = useFmPagesCollection();
	const imageFilesCollection = useImageFilesCollection();

	// Determine if we can query
	const hasValidCollections = !!fmPagesCollection && !!imageFilesCollection;
	const shouldQuery = isClient && hasValidCollections;

	// Query FM pages using the query builder syntax
	const fmQueryResult = useLiveQuery(
		q => {
			if (!shouldQuery || !fmPagesCollection) return undefined;
			return q.from({ fm: fmPagesCollection });
		},
		[shouldQuery, fmPagesCollection],
	);

	// Query image files using the query builder syntax
	const imgQueryResult = useLiveQuery(
		q => {
			if (!shouldQuery || !imageFilesCollection) return undefined;
			return q.from({ img: imageFilesCollection });
		},
		[shouldQuery, imageFilesCollection],
	);

	// Debug logging
	useEffect(() => {
		console.log('[FM Live Query] State:', {
			isClient,
			hasValidCollections,
			shouldQuery,
			handle: workspace.handle,
			showArchived,
			fmStatus: fmQueryResult?.status,
			fmDataLength: fmQueryResult?.data?.length ?? 0,
			imgStatus: imgQueryResult?.status,
			imgDataLength: imgQueryResult?.data?.length ?? 0,
		});
	}, [
		isClient,
		hasValidCollections,
		shouldQuery,
		workspace.handle,
		showArchived,
		fmQueryResult?.status,
		fmQueryResult?.data?.length,
		imgQueryResult?.status,
		imgQueryResult?.data?.length,
	]);

	// Join FM pages with images client-side
	const data = useMemo(() => {
		if (!fmQueryResult?.data) return undefined;

		// Data from q.from({ alias: collection }) returns the raw items
		const fmPages = fmQueryResult.data as FmPageSync[];
		const imageFiles = (imgQueryResult?.data as ImageFileSync[] | undefined) ?? [];

		// Create a map of images by ID for fast lookup
		const imagesById = new Map(imageFiles.map(img => [img.id, img]));

		// Filter and join
		return fmPages
			.filter(fm => {
				// Filter by workspace handle
				if (fm.handle !== workspace.handle) return false;

				// Filter archived items (unless showing archived)
				if (!showArchived && fm.archived_at !== null) return false;

				return true;
			})
			.map(fm => ({
				...fm,
				coverArt: fm.coverArtId ? imagesById.get(fm.coverArtId) ?? null : null,
			}))
			.sort(
				(a, b) =>
					new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
			);
	}, [fmQueryResult?.data, imgQueryResult?.data, workspace.handle, showArchived]);

	// Return loading state if not ready
	if (!shouldQuery) {
		return {
			data: undefined,
			isLoading: true,
			isEnabled: false,
		};
	}

	const isLoading =
		fmQueryResult?.status === 'loading' || imgQueryResult?.status === 'loading';

	return {
		data,
		isLoading,
		isEnabled: true,
	};
}


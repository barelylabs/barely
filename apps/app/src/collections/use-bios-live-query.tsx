'use client';

import { useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { useLiveQuery } from '@tanstack/react-db';

import type { BioSync } from './bios.collection';
import { useBiosCollection } from './bios.collection';

interface UseBiosLiveQueryOptions {
	showArchived?: boolean;
}

interface UseBiosLiveQueryResult {
	data: BioSync[] | undefined;
	isLoading: boolean;
	isEnabled: boolean;
}

/**
 * Hook to query Bios using TanStack DB live queries.
 * Handles SSR, collection readiness, and workspace filtering.
 */
export function useBiosLiveQuery(
	options: UseBiosLiveQueryOptions = {},
): UseBiosLiveQueryResult {
	const { showArchived = false } = options;
	const { workspace } = useWorkspace();

	// Track client-side rendering
	const [isClient, setIsClient] = useState(false);
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Get collection
	const biosCollection = useBiosCollection();

	// Determine if we can query
	const hasValidCollection = !!biosCollection;
	const shouldQuery = isClient && hasValidCollection;

	// Query Bios using the query builder syntax
	const queryResult = useLiveQuery(
		q => {
			if (!shouldQuery) return undefined;
			return q.from({ bios: biosCollection });
		},
		[shouldQuery, biosCollection],
	);

	// Debug logging
	useEffect(() => {
		console.log('[Bios Live Query] State:', {
			isClient,
			hasValidCollection,
			shouldQuery,
			handle: workspace.handle,
			showArchived,
			status: queryResult.status,
			dataLength: queryResult.data?.length ?? 0,
		});
	}, [
		isClient,
		hasValidCollection,
		shouldQuery,
		workspace.handle,
		showArchived,
		queryResult.status,
		queryResult.data?.length,
	]);

	// Filter and sort data
	const data = useMemo(() => {
		if (!queryResult.data) return undefined;

		const bios = queryResult.data as BioSync[];

		return bios
			.filter(bio => {
				// Filter by workspace handle
				if (bio.handle !== workspace.handle) return false;

				// Filter archived items (unless showing archived)
				if (!showArchived && bio.archived_at !== null) return false;

				return true;
			})
			.sort(
				(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
			);
	}, [queryResult.data, workspace.handle, showArchived]);

	// Return loading state if not ready
	if (!shouldQuery) {
		return {
			data: undefined,
			isLoading: true,
			isEnabled: false,
		};
	}

	const isLoading = queryResult.status === 'loading';

	return {
		data,
		isLoading,
		isEnabled: true,
	};
}

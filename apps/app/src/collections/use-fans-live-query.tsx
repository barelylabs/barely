'use client';

import { useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { useLiveQuery } from '@tanstack/react-db';

import type { FanSync } from './fans.collection';
import { useFansCollection } from './fans.collection';

interface UseFansLiveQueryOptions {
	showArchived?: boolean;
}

interface UseFansLiveQueryResult {
	data: FanSync[] | undefined;
	isLoading: boolean;
	isEnabled: boolean;
}

/**
 * Hook to query Fans using TanStack DB live queries.
 * Handles SSR, collection readiness, and filtering.
 */
export function useFansLiveQuery(
	options: UseFansLiveQueryOptions = {},
): UseFansLiveQueryResult {
	const { showArchived = false } = options;
	const { workspace } = useWorkspace();

	// Track client-side rendering
	const [isClient, setIsClient] = useState(false);
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Get collection
	const fansCollection = useFansCollection();

	// Determine if we can query
	const hasValidCollection = !!fansCollection;
	const shouldQuery = isClient && hasValidCollection;

	// Query Fans using the query builder syntax
	const fansQueryResult = useLiveQuery(
		q => {
			if (!shouldQuery) return undefined;
			return q.from({ fans: fansCollection });
		},
		[shouldQuery, fansCollection],
	);

	// Debug logging
	useEffect(() => {
		console.log('[Fans Live Query] State:', {
			isClient,
			hasValidCollection,
			shouldQuery,
			workspaceId: workspace.id,
			showArchived,
			fansStatus: fansQueryResult.status,
			fansDataLength: fansQueryResult.data?.length ?? 0,
		});
	}, [
		isClient,
		hasValidCollection,
		shouldQuery,
		workspace.id,
		showArchived,
		fansQueryResult.status,
		fansQueryResult.data?.length,
	]);

	// Filter and sort data
	const data = useMemo(() => {
		if (!fansQueryResult.data) return undefined;

		const fans = fansQueryResult.data as FanSync[];

		return fans
			.filter(fan => {
				// Filter by workspace
				if (fan.workspaceId !== workspace.id) return false;

				// Filter archived items (unless showing archived)
				if (!showArchived && fan.archived_at !== null) return false;

				return true;
			})
			.sort(
				(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
			);
	}, [fansQueryResult.data, workspace.id, showArchived]);

	// Return loading state if not ready
	if (!shouldQuery) {
		return {
			data: undefined,
			isLoading: true,
			isEnabled: false,
		};
	}

	const isLoading = fansQueryResult.status === 'loading';

	return {
		data,
		isLoading,
		isEnabled: true,
	};
}

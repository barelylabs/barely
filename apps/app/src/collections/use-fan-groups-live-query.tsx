'use client';

import { useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { useLiveQuery } from '@tanstack/react-db';

import type { FanGroupSync } from './fan-groups.collection';
import { useFanGroupsCollection } from './fan-groups.collection';

interface UseFanGroupsLiveQueryOptions {
	showArchived?: boolean;
}

interface UseFanGroupsLiveQueryResult {
	data: FanGroupSync[] | undefined;
	isLoading: boolean;
	isEnabled: boolean;
}

/**
 * Hook to query FanGroups using TanStack DB live queries.
 * Handles SSR, collection readiness, and filtering.
 */
export function useFanGroupsLiveQuery(
	options: UseFanGroupsLiveQueryOptions = {},
): UseFanGroupsLiveQueryResult {
	const { showArchived = false } = options;
	const { workspace } = useWorkspace();

	// Track client-side rendering
	const [isClient, setIsClient] = useState(false);
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Get collection
	const fanGroupsCollection = useFanGroupsCollection();

	// Determine if we can query
	const hasValidCollection = !!fanGroupsCollection;
	const shouldQuery = isClient && hasValidCollection;

	// Query FanGroups using the query builder syntax
	const fanGroupsQueryResult = useLiveQuery(
		q => {
			if (!shouldQuery) return undefined;
			return q.from({ fanGroups: fanGroupsCollection });
		},
		[shouldQuery, fanGroupsCollection],
	);

	// Debug logging
	useEffect(() => {
		console.log('[FanGroups Live Query] State:', {
			isClient,
			hasValidCollection,
			shouldQuery,
			workspaceId: workspace.id,
			showArchived,
			fanGroupsStatus: fanGroupsQueryResult.status,
			fanGroupsDataLength: fanGroupsQueryResult.data?.length ?? 0,
		});
	}, [
		isClient,
		hasValidCollection,
		shouldQuery,
		workspace.id,
		showArchived,
		fanGroupsQueryResult.status,
		fanGroupsQueryResult.data?.length,
	]);

	// Filter and sort data
	const data = useMemo(() => {
		if (!fanGroupsQueryResult.data) return undefined;

		const fanGroups = fanGroupsQueryResult.data as FanGroupSync[];

		return fanGroups
			.filter(fanGroup => {
				// Filter by workspace
				if (fanGroup.workspaceId !== workspace.id) return false;

				// Filter archived items (unless showing archived)
				if (!showArchived && fanGroup.archived_at !== null) return false;

				return true;
			})
			.sort(
				(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
			);
	}, [fanGroupsQueryResult.data, workspace.id, showArchived]);

	// Return loading state if not ready
	if (!shouldQuery) {
		return {
			data: undefined,
			isLoading: true,
			isEnabled: false,
		};
	}

	const isLoading = fanGroupsQueryResult.status === 'loading';

	return {
		data,
		isLoading,
		isEnabled: true,
	};
}

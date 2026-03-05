'use client';

import { useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { useLiveQuery } from '@tanstack/react-db';

import type { LinkSync } from './links.collection';
import { useLinksCollection } from './links.collection';

interface UseLinksLiveQueryOptions {
	showArchived?: boolean;
}

interface UseLinksLiveQueryResult {
	data: LinkSync[] | undefined;
	isLoading: boolean;
	isEnabled: boolean;
}

/**
 * Hook to query Links using TanStack DB live queries.
 * Handles SSR, collection readiness, and workspace filtering.
 */
export function useLinksLiveQuery(
	options: UseLinksLiveQueryOptions = {},
): UseLinksLiveQueryResult {
	const { showArchived = false } = options;
	const { workspace } = useWorkspace();

	// Track client-side rendering
	const [isClient, setIsClient] = useState(false);
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Get collection
	const linksCollection = useLinksCollection();

	// Determine if we can query
	const hasValidCollection = !!linksCollection;
	const shouldQuery = isClient && hasValidCollection;

	// Query Links using the query builder syntax
	const queryResult = useLiveQuery(
		q => {
			if (!shouldQuery) return undefined;
			return q.from({ links: linksCollection });
		},
		[shouldQuery, linksCollection],
	);

	// Debug logging
	useEffect(() => {
		console.log('[Links Live Query] State:', {
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

		const links = queryResult.data as LinkSync[];

		return links
			.filter(link => {
				// Filter by workspace handle
				if (link.handle !== workspace.handle) return false;

				// Filter archived items (unless showing archived)
				if (!showArchived && link.archived === true) return false;

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

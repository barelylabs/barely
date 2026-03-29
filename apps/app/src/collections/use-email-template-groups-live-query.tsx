'use client';

import { useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { useLiveQuery } from '@tanstack/react-db';

import type { EmailTemplateGroupSync } from './email-template-groups.collection';
import { useEmailTemplateGroupsCollection } from './email-template-groups.collection';

interface UseEmailTemplateGroupsLiveQueryOptions {
	showArchived?: boolean;
}

interface UseEmailTemplateGroupsLiveQueryResult {
	data: EmailTemplateGroupSync[] | undefined;
	isLoading: boolean;
	isEnabled: boolean;
}

/**
 * Hook to query EmailTemplateGroups using TanStack DB live queries.
 * Handles SSR, collection readiness, and filtering.
 */
export function useEmailTemplateGroupsLiveQuery(
	options: UseEmailTemplateGroupsLiveQueryOptions = {},
): UseEmailTemplateGroupsLiveQueryResult {
	const { showArchived = false } = options;
	const { workspace } = useWorkspace();

	// Track client-side rendering
	const [isClient, setIsClient] = useState(false);
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Get collection
	const groupsCollection = useEmailTemplateGroupsCollection();

	// Determine if we can query
	const hasValidCollection = !!groupsCollection;
	const shouldQuery = isClient && hasValidCollection;

	// Query EmailTemplateGroups using the query builder syntax
	const groupsQueryResult = useLiveQuery(
		q => {
			if (!shouldQuery) return undefined;
			return q.from({ groups: groupsCollection });
		},
		[shouldQuery, groupsCollection],
	);

	// Debug logging
	useEffect(() => {
		console.log('[EmailTemplateGroups Live Query] State:', {
			isClient,
			hasValidCollection,
			shouldQuery,
			workspaceId: workspace.id,
			showArchived,
			groupsStatus: groupsQueryResult.status,
			groupsDataLength: groupsQueryResult.data?.length ?? 0,
		});
	}, [
		isClient,
		hasValidCollection,
		shouldQuery,
		workspace.id,
		showArchived,
		groupsQueryResult.status,
		groupsQueryResult.data?.length,
	]);

	// Filter and sort data
	const data = useMemo(() => {
		if (!groupsQueryResult.data) return undefined;

		const groups = groupsQueryResult.data as EmailTemplateGroupSync[];

		return groups
			.filter(group => {
				// Filter by workspace
				if (group.workspaceId !== workspace.id) return false;

				// Filter archived items (unless showing archived)
				if (!showArchived && group.archived_at !== null) return false;

				return true;
			})
			.sort(
				(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
			);
	}, [groupsQueryResult.data, workspace.id, showArchived]);

	// Return loading state if not ready
	if (!shouldQuery) {
		return {
			data: undefined,
			isLoading: true,
			isEnabled: false,
		};
	}

	const isLoading = groupsQueryResult.status === 'loading';

	return {
		data,
		isLoading,
		isEnabled: true,
	};
}

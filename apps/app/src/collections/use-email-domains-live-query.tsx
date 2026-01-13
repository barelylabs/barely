'use client';

import { useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { useLiveQuery } from '@tanstack/react-db';

import type { EmailDomainSync } from './email-domains.collection';
import { useEmailDomainsCollection } from './email-domains.collection';

interface UseEmailDomainsLiveQueryOptions {
	showArchived?: boolean;
}

interface UseEmailDomainsLiveQueryResult {
	data: EmailDomainSync[] | undefined;
	isLoading: boolean;
	isEnabled: boolean;
}

/**
 * Hook to query EmailDomains using TanStack DB live queries.
 * Handles SSR, collection readiness, and filtering.
 */
export function useEmailDomainsLiveQuery(
	options: UseEmailDomainsLiveQueryOptions = {},
): UseEmailDomainsLiveQueryResult {
	const { showArchived = false } = options;
	const { workspace } = useWorkspace();

	// Track client-side rendering
	const [isClient, setIsClient] = useState(false);
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Get collection
	const domainsCollection = useEmailDomainsCollection();

	// Determine if we can query
	const hasValidCollection = !!domainsCollection;
	const shouldQuery = isClient && hasValidCollection;

	// Query EmailDomains using the query builder syntax
	const domainsQueryResult = useLiveQuery(
		q => {
			if (!shouldQuery) return undefined;
			return q.from({ domains: domainsCollection });
		},
		[shouldQuery, domainsCollection],
	);

	// Debug logging
	useEffect(() => {
		console.log('[EmailDomains Live Query] State:', {
			isClient,
			hasValidCollection,
			shouldQuery,
			workspaceId: workspace.id,
			showArchived,
			domainsStatus: domainsQueryResult.status,
			domainsDataLength: domainsQueryResult.data?.length ?? 0,
		});
	}, [
		isClient,
		hasValidCollection,
		shouldQuery,
		workspace.id,
		showArchived,
		domainsQueryResult.status,
		domainsQueryResult.data?.length,
	]);

	// Filter and sort data
	const data = useMemo(() => {
		if (!domainsQueryResult.data) return undefined;

		const domains = domainsQueryResult.data as EmailDomainSync[];

		return domains
			.filter(domain => {
				// Filter by workspace
				if (domain.workspaceId !== workspace.id) return false;

				// Filter archived items (unless showing archived)
				if (!showArchived && domain.archived_at !== null) return false;

				return true;
			})
			.sort(
				(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
			);
	}, [domainsQueryResult.data, workspace.id, showArchived]);

	// Return loading state if not ready
	if (!shouldQuery) {
		return {
			data: undefined,
			isLoading: true,
			isEnabled: false,
		};
	}

	const isLoading = domainsQueryResult.status === 'loading';

	return {
		data,
		isLoading,
		isEnabled: true,
	};
}

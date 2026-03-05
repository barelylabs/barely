'use client';

import { useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { useLiveQuery } from '@tanstack/react-db';

import type { EmailTemplateSync } from './email-templates.collection';
import { useEmailTemplatesCollection } from './email-templates.collection';

interface UseEmailTemplatesLiveQueryOptions {
	showArchived?: boolean;
	showBroadcastOnly?: boolean;
}

interface UseEmailTemplatesLiveQueryResult {
	data: EmailTemplateSync[] | undefined;
	isLoading: boolean;
	isEnabled: boolean;
}

/**
 * Hook to query EmailTemplates using TanStack DB live queries.
 * Handles SSR, collection readiness, and filtering.
 */
export function useEmailTemplatesLiveQuery(
	options: UseEmailTemplatesLiveQueryOptions = {},
): UseEmailTemplatesLiveQueryResult {
	const { showArchived = false, showBroadcastOnly = true } = options;
	const { workspace } = useWorkspace();

	// Track client-side rendering
	const [isClient, setIsClient] = useState(false);
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Get collection
	const templatesCollection = useEmailTemplatesCollection();

	// Determine if we can query
	const hasValidCollection = !!templatesCollection;
	const shouldQuery = isClient && hasValidCollection;

	// Query EmailTemplates using the query builder syntax
	const templatesQueryResult = useLiveQuery(
		q => {
			if (!shouldQuery) return undefined;
			return q.from({ templates: templatesCollection });
		},
		[shouldQuery, templatesCollection],
	);

	// Debug logging
	useEffect(() => {
		console.log('[EmailTemplates Live Query] State:', {
			isClient,
			hasValidCollection,
			shouldQuery,
			workspaceId: workspace.id,
			showArchived,
			showBroadcastOnly,
			templatesStatus: templatesQueryResult.status,
			templatesDataLength: templatesQueryResult.data?.length ?? 0,
		});
	}, [
		isClient,
		hasValidCollection,
		shouldQuery,
		workspace.id,
		showArchived,
		showBroadcastOnly,
		templatesQueryResult.status,
		templatesQueryResult.data?.length,
	]);

	// Filter and sort data
	const data = useMemo(() => {
		if (!templatesQueryResult.data) return undefined;

		const templates = templatesQueryResult.data as EmailTemplateSync[];

		return templates
			.filter(template => {
				// Filter by workspace
				if (template.workspaceId !== workspace.id) return false;

				// Filter archived items (unless showing archived)
				if (!showArchived && template.archived_at !== null) return false;

				// Filter broadcastOnly templates (they're hidden from templates list by default)
				if (!showBroadcastOnly && template.broadcastOnly) return false;

				return true;
			})
			.sort(
				(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
			);
	}, [templatesQueryResult.data, workspace.id, showArchived, showBroadcastOnly]);

	// Return loading state if not ready
	if (!shouldQuery) {
		return {
			data: undefined,
			isLoading: true,
			isEnabled: false,
		};
	}

	const isLoading = templatesQueryResult.status === 'loading';

	return {
		data,
		isLoading,
		isEnabled: true,
	};
}

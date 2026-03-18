'use client';

import { useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { useLiveQuery } from '@tanstack/react-db';

import type { EmailBroadcastSync } from './email-broadcasts.collection';
import type { EmailTemplateSync } from './email-templates.collection';
import { useEmailBroadcastsCollection } from './email-broadcasts.collection';
import { useEmailTemplatesCollection } from './email-templates.collection';

/**
 * Email template data for broadcast listing (subset for the join)
 */
export interface EmailBroadcastTemplateInfo {
	name: string;
	fromId: string;
	subject: string;
	previewText: string | null;
	body: string;
	replyTo: string | null;
}

export type EmailBroadcastWithTemplate = EmailBroadcastSync & {
	emailTemplate: EmailBroadcastTemplateInfo | null;
};

interface UseEmailBroadcastsLiveQueryOptions {
	showArchived?: boolean;
	showStatuses?: string[];
}

interface UseEmailBroadcastsLiveQueryResult {
	data: EmailBroadcastWithTemplate[] | undefined;
	isLoading: boolean;
	isEnabled: boolean;
}

/**
 * Hook to query EmailBroadcasts with their templates using TanStack DB live queries.
 * Handles SSR, collection readiness, and client-side joins EmailBroadcasts with EmailTemplates.
 */
export function useEmailBroadcastsLiveQuery(
	options: UseEmailBroadcastsLiveQueryOptions = {},
): UseEmailBroadcastsLiveQueryResult {
	const { showArchived = false, showStatuses } = options;
	const { workspace } = useWorkspace();

	// Track client-side rendering
	const [isClient, setIsClient] = useState(false);
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Get collections
	const broadcastsCollection = useEmailBroadcastsCollection();
	const templatesCollection = useEmailTemplatesCollection();

	// Determine if we can query
	const hasValidCollections = !!broadcastsCollection && !!templatesCollection;
	const shouldQuery = isClient && hasValidCollections;

	// Query EmailBroadcasts using the query builder syntax
	const broadcastsQueryResult = useLiveQuery(
		q => {
			if (!shouldQuery) return undefined;
			return q.from({ broadcasts: broadcastsCollection });
		},
		[shouldQuery, broadcastsCollection],
	);

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
		console.log('[EmailBroadcasts Live Query] State:', {
			isClient,
			hasValidCollections,
			shouldQuery,
			workspaceId: workspace.id,
			showArchived,
			showStatuses,
			broadcastsStatus: broadcastsQueryResult.status,
			broadcastsDataLength: broadcastsQueryResult.data?.length ?? 0,
			templatesStatus: templatesQueryResult.status,
			templatesDataLength: templatesQueryResult.data?.length ?? 0,
		});
	}, [
		isClient,
		hasValidCollections,
		shouldQuery,
		workspace.id,
		showArchived,
		showStatuses,
		broadcastsQueryResult.status,
		broadcastsQueryResult.data?.length,
		templatesQueryResult.status,
		templatesQueryResult.data?.length,
	]);

	// Join EmailBroadcasts with EmailTemplates client-side
	const data = useMemo(() => {
		if (!broadcastsQueryResult.data) return undefined;

		const broadcasts = broadcastsQueryResult.data as EmailBroadcastSync[];
		const templates =
			(templatesQueryResult.data as EmailTemplateSync[] | undefined) ?? [];

		// Create a map of templates by ID for fast lookup
		const templatesById = new Map(templates.map(template => [template.id, template]));

		// Filter and join
		return broadcasts
			.filter(broadcast => {
				// Filter by workspace
				if (broadcast.workspaceId !== workspace.id) return false;

				// Filter archived items (unless showing archived)
				if (!showArchived && broadcast.archived_at !== null) return false;

				// Filter by status if provided
				if (showStatuses?.length && !showStatuses.includes(broadcast.status))
					return false;

				return true;
			})
			.map(broadcast => {
				const template = templatesById.get(broadcast.emailTemplateId);
				return {
					...broadcast,
					emailTemplate:
						template ?
							{
								name: template.name,
								fromId: template.fromId,
								subject: template.subject,
								previewText: template.previewText,
								body: template.body,
								replyTo: template.replyTo,
							}
						:	null,
				};
			})
			.sort(
				(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
			);
	}, [
		broadcastsQueryResult.data,
		templatesQueryResult.data,
		workspace.id,
		showArchived,
		showStatuses,
	]);

	// Return loading state if not ready
	if (!shouldQuery) {
		return {
			data: undefined,
			isLoading: true,
			isEnabled: false,
		};
	}

	const isLoading =
		broadcastsQueryResult.status === 'loading' ||
		templatesQueryResult.status === 'loading';

	return {
		data,
		isLoading,
		isEnabled: true,
	};
}

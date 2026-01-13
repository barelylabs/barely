'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { useMemo, useRef } from 'react';
import { createResourceSearchParamsHook, useFocusGridList } from '@barely/hooks';

import type { EmailBroadcastWithTemplate } from '~/collections';
import { useEmailBroadcastsLiveQuery } from '~/collections';

// Define the page data type for email broadcasts (for backward compatibility)
type EmailBroadcastFromApi =
	AppRouterOutputs['emailBroadcast']['byWorkspace']['emailBroadcasts'][0];

// Type for broadcasts that have an email template (required for mapping to API format)
type EmailBroadcastWithRequiredTemplate = EmailBroadcastWithTemplate & {
	emailTemplate: NonNullable<EmailBroadcastWithTemplate['emailTemplate']>;
};

// Type guard to filter broadcasts with email template
function hasRequiredTemplate(
	broadcast: EmailBroadcastWithTemplate,
): broadcast is EmailBroadcastWithRequiredTemplate {
	return broadcast.emailTemplate !== null;
}

// Create the search params hook for email broadcasts
export const useEmailBroadcastSearchParams = createResourceSearchParamsHook({});

/**
 * Map Electric sync data to the existing API format for UI components
 * Note: Only call this with broadcasts that have an emailTemplate (use hasRequiredTemplate filter first)
 */
function mapToApiFormat(
	broadcast: EmailBroadcastWithRequiredTemplate,
): EmailBroadcastFromApi {
	return {
		id: broadcast.id,
		workspaceId: broadcast.workspaceId,
		// Relations
		emailTemplateId: broadcast.emailTemplateId,
		fanGroupId: broadcast.fanGroupId,
		// Status
		status: broadcast.status as EmailBroadcastFromApi['status'],
		scheduledAt: broadcast.scheduledAt ? new Date(broadcast.scheduledAt) : null,
		sentAt: broadcast.sentAt ? new Date(broadcast.sentAt) : null,
		// Error handling
		error: broadcast.error,
		triggerRunId: broadcast.triggerRunId,
		// Stats
		deliveries: broadcast.deliveries ?? 0,
		opens: broadcast.opens ?? 0,
		clicks: broadcast.clicks ?? 0,
		value: broadcast.value ?? 0,
		// Timestamps
		createdAt: new Date(broadcast.created_at),
		updatedAt: new Date(broadcast.updated_at),
		deletedAt: broadcast.deleted_at ? new Date(broadcast.deleted_at) : null,
		archivedAt: broadcast.archived_at ? new Date(broadcast.archived_at) : null,
		// Email template relation (now guaranteed to exist)
		emailTemplate: {
			name: broadcast.emailTemplate.name,
			fromId: broadcast.emailTemplate.fromId,
			subject: broadcast.emailTemplate.subject,
			previewText: broadcast.emailTemplate.previewText,
			body: broadcast.emailTemplate.body,
			replyTo: broadcast.emailTemplate.replyTo,
		},
	};
}

/**
 * Main hook for Email Broadcasts - uses Electric SQL live query for real-time data
 */
export function useEmailBroadcast() {
	const searchParams = useEmailBroadcastSearchParams();
	const {
		data: broadcasts,
		isLoading,
		isEnabled,
	} = useEmailBroadcastsLiveQuery({
		showArchived: searchParams.filters.showArchived,
		showStatuses: searchParams.filters.showStatuses,
	});

	// Grid list ref for focus management
	const gridListRef = useRef<HTMLDivElement | null>(null);
	const focusGridList = useFocusGridList('email-broadcasts');

	// Map and filter data
	const items = useMemo(() => {
		if (!broadcasts) return [];

		let filtered = broadcasts;

		// Apply search filter (by template name or subject)
		const search = searchParams.filters.search.toLowerCase();
		if (search) {
			filtered = filtered.filter(
				broadcast =>
					broadcast.emailTemplate?.name.toLowerCase().includes(search) ??
					broadcast.emailTemplate?.subject.toLowerCase().includes(search),
			);
		}

		// Map to API format (filter out broadcasts without email template first)
		return filtered.filter(hasRequiredTemplate).map(mapToApiFormat);
	}, [broadcasts, searchParams.filters.search]);

	// Compute last selected item
	const selectedIds = searchParams.selectedIds;
	const lastSelectedItemId = useMemo(() => {
		if (selectedIds === 'all') return items[0]?.id;
		if (Array.isArray(selectedIds) && selectedIds.length > 0) {
			return selectedIds[selectedIds.length - 1];
		}
		return undefined;
	}, [selectedIds, items]);

	const lastSelectedItem = useMemo(() => {
		if (!lastSelectedItemId) return undefined;
		return items.find(item => item.id === lastSelectedItemId);
	}, [lastSelectedItemId, items]);

	return {
		// Data
		items,
		// Selection
		lastSelectedItemId,
		lastSelectedItem,
		// Loading states
		isFetching: isLoading,
		isFetchingNextPage: false,
		isRefetching: false,
		isPending: !isEnabled,
		hasNextPage: false, // Electric syncs all data, no pagination
		// Fetch functions (no-ops for Electric)
		fetchNextPage: () => Promise.resolve(),
		refetch: () => Promise.resolve(),
		// Grid list
		gridListRef,
		focusGridList,
		// Search params
		...searchParams,
	};
}

// Export the old context hook name for backward compatibility
export const useEmailBroadcastsContext = useEmailBroadcast;

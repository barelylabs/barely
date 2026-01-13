'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { useMemo, useRef } from 'react';
import { createResourceSearchParamsHook, useFocusGridList } from '@barely/hooks';
import { parseAsBoolean, parseAsJson } from 'nuqs';

import type { EmailTemplateSync } from '~/collections';
import { useEmailTemplatesLiveQuery } from '~/collections';

// Define the page data type for email templates (for backward compatibility)
type EmailTemplateFromApi =
	AppRouterOutputs['emailTemplate']['byWorkspace']['emailTemplates'][0];

// Create the search params hook for email templates
export const useEmailTemplateSearchParams = createResourceSearchParamsHook({
	additionalParsers: {
		showTypes: parseAsJson<EmailTemplateFromApi['type'][]>(v =>
			Array.isArray(v) ? (v as EmailTemplateFromApi['type'][]) : [],
		).withDefault([]),
		showFlowOnly: parseAsBoolean.withDefault(false),
	},
});

/**
 * Map Electric sync data to the existing API format for UI components
 */
function mapToApiFormat(template: EmailTemplateSync): EmailTemplateFromApi {
	return {
		id: template.id,
		workspaceId: template.workspaceId,
		// Template info
		fromId: template.fromId,
		name: template.name,
		description: template.description,
		type: template.type as EmailTemplateFromApi['type'],
		flowOnly: template.flowOnly,
		broadcastOnly: template.broadcastOnly,
		// Email content
		replyTo: template.replyTo,
		subject: template.subject,
		previewText: template.previewText,
		body: template.body,
		// Stats
		deliveries: template.deliveries ?? 0,
		opens: template.opens ?? 0,
		clicks: template.clicks ?? 0,
		value: template.value ?? 0,
		// Timestamps
		createdAt: new Date(template.created_at),
		updatedAt: new Date(template.updated_at),
		deletedAt: template.deleted_at ? new Date(template.deleted_at) : null,
		archivedAt: template.archived_at ? new Date(template.archived_at) : null,
	};
}

/**
 * Main hook for Email Templates - uses Electric SQL live query for real-time data
 */
export function useEmailTemplate() {
	const searchParams = useEmailTemplateSearchParams();
	const {
		data: templates,
		isLoading,
		isEnabled,
	} = useEmailTemplatesLiveQuery({
		showArchived: searchParams.filters.showArchived,
		showBroadcastOnly: false, // Hide broadcastOnly templates from template list
	});

	// Grid list ref for focus management
	const gridListRef = useRef<HTMLDivElement | null>(null);
	const focusGridList = useFocusGridList('email-templates');

	// Map and filter data
	const items = useMemo(() => {
		if (!templates) return [];

		let filtered = templates;

		// Apply search filter (by name or subject)
		const search = searchParams.filters.search.toLowerCase();
		if (search) {
			filtered = filtered.filter(
				template =>
					template.name.toLowerCase().includes(search) ||
					template.subject.toLowerCase().includes(search),
			);
		}

		// Filter by showTypes if provided
		const showTypes = searchParams.filters.showTypes;
		if (showTypes.length) {
			filtered = filtered.filter(template =>
				showTypes.includes(template.type as EmailTemplateFromApi['type']),
			);
		}

		// Filter flowOnly templates (by default hide flowOnly templates)
		if (!searchParams.filters.showFlowOnly) {
			filtered = filtered.filter(template => !template.flowOnly);
		}

		// Map to API format
		return filtered.map(mapToApiFormat);
	}, [
		templates,
		searchParams.filters.search,
		searchParams.filters.showTypes,
		searchParams.filters.showFlowOnly,
	]);

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
export const useEmailTemplateContext = useEmailTemplate;

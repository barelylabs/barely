'use client';

import { useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { useLiveQuery } from '@tanstack/react-db';

import type { InvoiceClientSync } from './invoice-clients.collection';
import { useInvoiceClientsCollection } from './invoice-clients.collection';

interface UseInvoiceClientsLiveQueryOptions {
	showArchived?: boolean;
}

interface UseInvoiceClientsLiveQueryResult {
	data: InvoiceClientSync[] | undefined;
	isLoading: boolean;
	isEnabled: boolean;
}

/**
 * Hook to query InvoiceClients using TanStack DB live queries.
 * Handles SSR, collection readiness, and filtering.
 */
export function useInvoiceClientsLiveQuery(
	options: UseInvoiceClientsLiveQueryOptions = {},
): UseInvoiceClientsLiveQueryResult {
	const { showArchived = false } = options;
	const { workspace } = useWorkspace();

	// Track client-side rendering
	const [isClient, setIsClient] = useState(false);
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Get collection
	const clientsCollection = useInvoiceClientsCollection();

	// Determine if we can query
	const hasValidCollection = !!clientsCollection;
	const shouldQuery = isClient && hasValidCollection;

	// Query InvoiceClients using the query builder syntax
	const clientsQueryResult = useLiveQuery(
		q => {
			if (!shouldQuery) return undefined;
			return q.from({ clients: clientsCollection });
		},
		[shouldQuery, clientsCollection],
	);

	// Debug logging
	useEffect(() => {
		console.log('[InvoiceClients Live Query] State:', {
			isClient,
			hasValidCollection,
			shouldQuery,
			workspaceId: workspace.id,
			showArchived,
			clientsStatus: clientsQueryResult.status,
			clientsDataLength: clientsQueryResult.data?.length ?? 0,
		});
	}, [
		isClient,
		hasValidCollection,
		shouldQuery,
		workspace.id,
		showArchived,
		clientsQueryResult.status,
		clientsQueryResult.data?.length,
	]);

	// Filter and sort data
	const data = useMemo(() => {
		if (!clientsQueryResult.data) return undefined;

		const clients = clientsQueryResult.data as InvoiceClientSync[];

		return clients
			.filter(client => {
				// Filter by workspace
				if (client.workspaceId !== workspace.id) return false;

				// Filter archived items (unless showing archived)
				if (!showArchived && client.archived_at !== null) return false;

				return true;
			})
			.sort(
				(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
			);
	}, [clientsQueryResult.data, workspace.id, showArchived]);

	// Return loading state if not ready
	if (!shouldQuery) {
		return {
			data: undefined,
			isLoading: true,
			isEnabled: false,
		};
	}

	const isLoading = clientsQueryResult.status === 'loading';

	return {
		data,
		isLoading,
		isEnabled: true,
	};
}

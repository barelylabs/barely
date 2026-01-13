'use client';

import { useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { useLiveQuery } from '@tanstack/react-db';

import type { InvoiceClientSync } from './invoice-clients.collection';
import type { InvoiceSync } from './invoices.collection';
import { useInvoiceClientsCollection } from './invoice-clients.collection';
import { useInvoicesCollection } from './invoices.collection';

export type InvoiceWithClient = InvoiceSync & {
	client: InvoiceClientSync | null;
};

interface UseInvoicesLiveQueryOptions {
	showArchived?: boolean;
	status?: string | null;
	clientId?: string | null;
}

interface UseInvoicesLiveQueryResult {
	data: InvoiceWithClient[] | undefined;
	isLoading: boolean;
	isEnabled: boolean;
}

/**
 * Hook to query Invoices with their clients using TanStack DB live queries.
 * Handles SSR, collection readiness, and client-side joins Invoices with InvoiceClients.
 */
export function useInvoicesLiveQuery(
	options: UseInvoicesLiveQueryOptions = {},
): UseInvoicesLiveQueryResult {
	const { showArchived = false, status, clientId } = options;
	const { workspace } = useWorkspace();

	// Track client-side rendering
	const [isClient, setIsClient] = useState(false);
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Get collections
	const invoicesCollection = useInvoicesCollection();
	const clientsCollection = useInvoiceClientsCollection();

	// Determine if we can query
	const hasValidCollections = !!invoicesCollection && !!clientsCollection;
	const shouldQuery = isClient && hasValidCollections;

	// Query Invoices using the query builder syntax
	const invoicesQueryResult = useLiveQuery(
		q => {
			if (!shouldQuery) return undefined;
			return q.from({ invoices: invoicesCollection });
		},
		[shouldQuery, invoicesCollection],
	);

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
		console.log('[Invoices Live Query] State:', {
			isClient,
			hasValidCollections,
			shouldQuery,
			workspaceId: workspace.id,
			showArchived,
			status,
			clientId,
			invoicesStatus: invoicesQueryResult.status,
			invoicesDataLength: invoicesQueryResult.data?.length ?? 0,
			clientsStatus: clientsQueryResult.status,
			clientsDataLength: clientsQueryResult.data?.length ?? 0,
		});
	}, [
		isClient,
		hasValidCollections,
		shouldQuery,
		workspace.id,
		showArchived,
		status,
		clientId,
		invoicesQueryResult.status,
		invoicesQueryResult.data?.length,
		clientsQueryResult.status,
		clientsQueryResult.data?.length,
	]);

	// Join Invoices with InvoiceClients client-side
	const data = useMemo(() => {
		if (!invoicesQueryResult.data) return undefined;

		// Data from q.from({ alias: collection }) returns the raw items
		const invoices = invoicesQueryResult.data as InvoiceSync[];
		const clients = (clientsQueryResult.data as InvoiceClientSync[] | undefined) ?? [];

		// Create a map of clients by ID for fast lookup
		const clientsById = new Map(clients.map(client => [client.id, client]));

		// Filter and join
		return invoices
			.filter(invoice => {
				// Filter by workspace
				if (invoice.workspaceId !== workspace.id) return false;

				// Filter archived items (unless showing archived)
				if (!showArchived && invoice.archived_at !== null) return false;

				// Filter by status if provided
				if (status && invoice.status !== status) return false;

				// Filter by clientId if provided
				if (clientId && invoice.clientId !== clientId) return false;

				return true;
			})
			.map(invoice => ({
				...invoice,
				client: invoice.clientId ? (clientsById.get(invoice.clientId) ?? null) : null,
			}))
			.sort(
				(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
			);
	}, [
		invoicesQueryResult.data,
		clientsQueryResult.data,
		workspace.id,
		showArchived,
		status,
		clientId,
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
		invoicesQueryResult.status === 'loading' || clientsQueryResult.status === 'loading';

	return {
		data,
		isLoading,
		isEnabled: true,
	};
}

'use client';

import { useEffect, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import { createCollection } from '@tanstack/react-db';
import { z } from 'zod/v4';

/**
 * Zod schema for InvoiceClient data synced from Electric
 * Note: Electric returns snake_case column names from PostgreSQL
 */
const invoiceClientSyncSchema = z.object({
	id: z.string(),
	created_at: z.string(), // Electric returns as string timestamp
	updated_at: z.string(),
	deleted_at: z.string().nullable(),
	archived_at: z.string().nullable(),
	workspaceId: z.string(),
	// Client information
	name: z.string(),
	email: z.string(),
	company: z.string().nullable(),
	address: z.string().nullable(), // deprecated
	// Address fields
	country: z.string().nullable(),
	addressLine1: z.string().nullable(),
	addressLine2: z.string().nullable(),
	city: z.string().nullable(),
	state: z.string().nullable(),
	postalCode: z.string().nullable(),
	// Stripe
	stripeCustomerId: z.string(),
});

export type InvoiceClientSync = z.infer<typeof invoiceClientSyncSchema>;

// Cache for collection instances to avoid recreation
type InvoiceClientsCollectionType = ReturnType<
	typeof createInvoiceClientsCollectionInternal
>;
const invoiceClientsCollectionCache = new Map<string, InvoiceClientsCollectionType>();

/**
 * Internal function to create an InvoiceClients collection for a specific workspace
 */
function createInvoiceClientsCollectionInternal(workspaceId: string, baseUrl: string) {
	return createCollection(
		electricCollectionOptions({
			id: `invoice-clients-${workspaceId}`,
			schema: invoiceClientSyncSchema,
			getKey: (item: InvoiceClientSync) => item.id,
			shapeOptions: {
				url: `${baseUrl}/api/electric/v1/shape`,
				params: {
					table: '"InvoiceClients"',
					where: `"workspaceId" = $1 AND "deleted_at" IS NULL`,
					'params[1]': workspaceId,
				},
				onError: (error: Error) => {
					console.error('[Electric Sync] Error syncing InvoiceClients:', error);
				},
			},
		}),
	);
}

/**
 * Factory function to create and cache an InvoiceClients collection for a workspace.
 * Used by ElectricPreSyncProvider to pre-sync all workspaces on app load.
 *
 * @returns The collection and whether it was newly created
 */
export function createInvoiceClientsCollectionForWorkspace(
	workspaceId: string,
	baseUrl: string,
): { collection: InvoiceClientsCollectionType; isNew: boolean } {
	const cached = invoiceClientsCollectionCache.get(workspaceId);
	if (cached) {
		return { collection: cached, isNew: false };
	}

	const collection = createInvoiceClientsCollectionInternal(workspaceId, baseUrl);
	invoiceClientsCollectionCache.set(workspaceId, collection);
	console.log(
		'[InvoiceClients Collection] Created collection for workspace:',
		workspaceId,
	);
	return { collection, isNew: true };
}

/**
 * Get an InvoiceClients collection from cache (does not create if missing)
 */
export function getInvoiceClientsCollectionFromCache(
	workspaceId: string,
): InvoiceClientsCollectionType | undefined {
	return invoiceClientsCollectionCache.get(workspaceId);
}

/**
 * Hook to get the InvoiceClients collection for the current workspace.
 * The collection should already be pre-synced by ElectricPreSyncProvider.
 * Returns null if not yet available (pre-sync still in progress).
 */
export function useInvoiceClientsCollection(): InvoiceClientsCollectionType | null {
	const { workspace } = useWorkspace();
	const [isClient, setIsClient] = useState(false);
	const [, forceUpdate] = useState(0);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// Poll for collection availability if not yet cached
	useEffect(() => {
		if (!isClient) return;

		const cached = invoiceClientsCollectionCache.get(workspace.id);
		if (cached) return;

		// Poll every 100ms until collection is available
		const interval = setInterval(() => {
			if (invoiceClientsCollectionCache.has(workspace.id)) {
				forceUpdate(n => n + 1);
				clearInterval(interval);
			}
		}, 100);

		return () => clearInterval(interval);
	}, [workspace.id, isClient]);

	// Only read from cache - pre-sync provider handles creation
	if (!isClient) return null;
	return invoiceClientsCollectionCache.get(workspace.id) ?? null;
}

/**
 * Utility to clear the collection cache (useful for logout)
 */
export function clearInvoiceClientsCollectionCache() {
	invoiceClientsCollectionCache.clear();
}

/**
 * Get the collection cache (for sync status tracking)
 */
export function getInvoiceClientsCollectionCache() {
	return invoiceClientsCollectionCache;
}

export type { InvoiceClientsCollectionType };

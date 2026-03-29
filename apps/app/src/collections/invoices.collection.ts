'use client';

import { useEffect, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import { createCollection } from '@tanstack/react-db';
import { z } from 'zod/v4';

/**
 * Zod schema for Invoice data synced from Electric
 * Note: Electric returns snake_case column names from PostgreSQL
 */
const invoiceSyncSchema = z.object({
	id: z.string(),
	created_at: z.string(), // Electric returns as string timestamp
	updated_at: z.string(),
	deleted_at: z.string().nullable(),
	archived_at: z.string().nullable(),
	workspaceId: z.string(),
	// Invoice identifiers
	invoiceNumber: z.string(),
	clientId: z.string(),
	// Invoice details
	lineItems: z.unknown(), // JSONB - will be array of line items
	tax: z.number(),
	subtotal: z.number(),
	total: z.number(),
	poNumber: z.string().nullable(),
	payerMemo: z.string().nullable(),
	notes: z.string().nullable(),
	// Dates and status
	dueDate: z.string(),
	status: z.string(), // 'created' | 'sent' | 'viewed' | 'paid' | 'voided'
	// Payment tracking
	stripePaymentIntentId: z.string().nullable(),
	// Recurring invoice fields
	subscriptionId: z.string().nullable(),
	billingInterval: z.string().nullable(), // 'monthly' | 'quarterly' | 'yearly'
	type: z.string(), // 'oneTime' | 'recurring' | 'recurringOptional'
	recurringDiscountPercent: z.number(),
	// Email tracking
	lastResendId: z.string().nullable(),
	// Activity tracking
	sentAt: z.string().nullable(),
	viewedAt: z.string().nullable(),
	paidAt: z.string().nullable(),
});

export type InvoiceSync = z.infer<typeof invoiceSyncSchema>;

// Cache for collection instances to avoid recreation
type InvoicesCollectionType = ReturnType<typeof createInvoicesCollectionInternal>;
const invoicesCollectionCache = new Map<string, InvoicesCollectionType>();

/**
 * Internal function to create an Invoices collection for a specific workspace
 */
function createInvoicesCollectionInternal(workspaceId: string, baseUrl: string) {
	return createCollection(
		electricCollectionOptions({
			id: `invoices-${workspaceId}`,
			schema: invoiceSyncSchema,
			getKey: (item: InvoiceSync) => item.id,
			shapeOptions: {
				url: `${baseUrl}/api/electric/v1/shape`,
				params: {
					table: '"Invoices"',
					where: `"workspaceId" = $1 AND "deleted_at" IS NULL`,
					'params[1]': workspaceId,
				},
				onError: (error: Error) => {
					console.error('[Electric Sync] Error syncing Invoices:', error);
				},
			},
		}),
	);
}

/**
 * Factory function to create and cache an Invoices collection for a workspace.
 * Used by ElectricPreSyncProvider to pre-sync all workspaces on app load.
 *
 * @returns The collection and whether it was newly created
 */
export function createInvoicesCollectionForWorkspace(
	workspaceId: string,
	baseUrl: string,
): { collection: InvoicesCollectionType; isNew: boolean } {
	const cached = invoicesCollectionCache.get(workspaceId);
	if (cached) {
		return { collection: cached, isNew: false };
	}

	const collection = createInvoicesCollectionInternal(workspaceId, baseUrl);
	invoicesCollectionCache.set(workspaceId, collection);
	console.log('[Invoices Collection] Created collection for workspace:', workspaceId);
	return { collection, isNew: true };
}

/**
 * Get an Invoices collection from cache (does not create if missing)
 */
export function getInvoicesCollectionFromCache(
	workspaceId: string,
): InvoicesCollectionType | undefined {
	return invoicesCollectionCache.get(workspaceId);
}

/**
 * Hook to get the Invoices collection for the current workspace.
 * The collection should already be pre-synced by ElectricPreSyncProvider.
 * Returns null if not yet available (pre-sync still in progress).
 */
export function useInvoicesCollection(): InvoicesCollectionType | null {
	const { workspace } = useWorkspace();
	const [isClient, setIsClient] = useState(false);
	const [, forceUpdate] = useState(0);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// Poll for collection availability if not yet cached
	useEffect(() => {
		if (!isClient) return;

		const cached = invoicesCollectionCache.get(workspace.id);
		if (cached) return;

		// Poll every 100ms until collection is available
		const interval = setInterval(() => {
			if (invoicesCollectionCache.has(workspace.id)) {
				forceUpdate(n => n + 1);
				clearInterval(interval);
			}
		}, 100);

		return () => clearInterval(interval);
	}, [workspace.id, isClient]);

	// Only read from cache - pre-sync provider handles creation
	if (!isClient) return null;
	return invoicesCollectionCache.get(workspace.id) ?? null;
}

/**
 * Utility to clear the collection cache (useful for logout)
 */
export function clearInvoicesCollectionCache() {
	invoicesCollectionCache.clear();
}

/**
 * Get the collection cache (for sync status tracking)
 */
export function getInvoicesCollectionCache() {
	return invoicesCollectionCache;
}

export type { InvoicesCollectionType };

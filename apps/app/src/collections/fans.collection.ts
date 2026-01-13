'use client';

import { useEffect, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import { createCollection } from '@tanstack/react-db';
import { z } from 'zod/v4';

/**
 * Zod schema for Fan data synced from Electric
 * Note: Electric returns snake_case column names from PostgreSQL
 */
const fanSyncSchema = z.object({
	id: z.string(),
	created_at: z.string(), // Electric returns as string timestamp
	updated_at: z.string(),
	deleted_at: z.string().nullable(),
	archived_at: z.string().nullable(),
	workspaceId: z.string(),
	// Marketing opt-ins
	emailMarketingOptIn: z.boolean(),
	smsMarketingOptIn: z.boolean(),
	// Contact info
	firstName: z.string().nullable(),
	lastName: z.string().nullable(),
	fullName: z.string(),
	email: z.string(),
	phoneNumber: z.string().nullable(),
	appReferer: z.string().nullable(), // 'vip' | 'cart' | 'bio'
	// Shipping address
	shippingAddressLine1: z.string().nullable(),
	shippingAddressLine2: z.string().nullable(),
	shippingAddressCity: z.string().nullable(),
	shippingAddressState: z.string().nullable(),
	shippingAddressCountry: z.string().nullable(),
	shippingAddressPostalCode: z.string().nullable(),
	// Billing address
	billingAddressPostalCode: z.string().nullable(),
	billingAddressCountry: z.string().nullable(),
	// Stripe
	stripeCustomerId: z.string().nullable(),
	stripePaymentMethodId: z.string().nullable(),
});

export type FanSync = z.infer<typeof fanSyncSchema>;

// Cache for collection instances to avoid recreation
type FansCollectionType = ReturnType<typeof createFansCollectionInternal>;
const fansCollectionCache = new Map<string, FansCollectionType>();

/**
 * Internal function to create a Fans collection for a specific workspace
 */
function createFansCollectionInternal(workspaceId: string, baseUrl: string) {
	return createCollection(
		electricCollectionOptions({
			id: `fans-${workspaceId}`,
			schema: fanSyncSchema,
			getKey: (item: FanSync) => item.id,
			shapeOptions: {
				url: `${baseUrl}/api/electric/v1/shape`,
				params: {
					table: '"Fans"',
					where: `"workspaceId" = $1 AND "deleted_at" IS NULL`,
					'params[1]': workspaceId,
				},
				onError: (error: Error) => {
					console.error('[Electric Sync] Error syncing Fans:', error);
				},
			},
		}),
	);
}

/**
 * Factory function to create and cache a Fans collection for a workspace.
 * Used by ElectricPreSyncProvider to pre-sync all workspaces on app load.
 *
 * @returns The collection and whether it was newly created
 */
export function createFansCollectionForWorkspace(
	workspaceId: string,
	baseUrl: string,
): { collection: FansCollectionType; isNew: boolean } {
	const cached = fansCollectionCache.get(workspaceId);
	if (cached) {
		return { collection: cached, isNew: false };
	}

	const collection = createFansCollectionInternal(workspaceId, baseUrl);
	fansCollectionCache.set(workspaceId, collection);
	console.log('[Fans Collection] Created collection for workspace:', workspaceId);
	return { collection, isNew: true };
}

/**
 * Get a Fans collection from cache (does not create if missing)
 */
export function getFansCollectionFromCache(
	workspaceId: string,
): FansCollectionType | undefined {
	return fansCollectionCache.get(workspaceId);
}

/**
 * Hook to get the Fans collection for the current workspace.
 * The collection should already be pre-synced by ElectricPreSyncProvider.
 * Returns null if not yet available (pre-sync still in progress).
 */
export function useFansCollection(): FansCollectionType | null {
	const { workspace } = useWorkspace();
	const [isClient, setIsClient] = useState(false);
	const [, forceUpdate] = useState(0);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// Poll for collection availability if not yet cached
	useEffect(() => {
		if (!isClient) return;

		const cached = fansCollectionCache.get(workspace.id);
		if (cached) return;

		// Poll every 100ms until collection is available
		const interval = setInterval(() => {
			if (fansCollectionCache.has(workspace.id)) {
				forceUpdate(n => n + 1);
				clearInterval(interval);
			}
		}, 100);

		return () => clearInterval(interval);
	}, [workspace.id, isClient]);

	// Only read from cache - pre-sync provider handles creation
	if (!isClient) return null;
	return fansCollectionCache.get(workspace.id) ?? null;
}

/**
 * Utility to clear the collection cache (useful for logout)
 */
export function clearFansCollectionCache() {
	fansCollectionCache.clear();
}

/**
 * Get the collection cache (for sync status tracking)
 */
export function getFansCollectionCache() {
	return fansCollectionCache;
}

export type { FansCollectionType };

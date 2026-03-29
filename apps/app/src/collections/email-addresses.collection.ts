'use client';

import { useEffect, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import { createCollection } from '@tanstack/react-db';
import { z } from 'zod/v4';

/**
 * Zod schema for EmailAddress data synced from Electric
 * Note: Electric returns snake_case column names from PostgreSQL
 */
const emailAddressSyncSchema = z.object({
	id: z.string(),
	created_at: z.string(), // Electric returns as string timestamp
	updated_at: z.string(),
	deleted_at: z.string().nullable(),
	archived_at: z.string().nullable(),
	workspaceId: z.string(),
	// Address info
	username: z.string(),
	domainId: z.string(),
	replyTo: z.string().nullable(),
	defaultFriendlyName: z.string().nullable(),
	default: z.boolean(),
});

export type EmailAddressSync = z.infer<typeof emailAddressSyncSchema>;

// Cache for collection instances to avoid recreation
type EmailAddressesCollectionType = ReturnType<
	typeof createEmailAddressesCollectionInternal
>;
const emailAddressesCollectionCache = new Map<string, EmailAddressesCollectionType>();

/**
 * Internal function to create an EmailAddresses collection for a specific workspace
 */
function createEmailAddressesCollectionInternal(workspaceId: string, baseUrl: string) {
	return createCollection(
		electricCollectionOptions({
			id: `email-addresses-${workspaceId}`,
			schema: emailAddressSyncSchema,
			getKey: (item: EmailAddressSync) => item.id,
			shapeOptions: {
				url: `${baseUrl}/api/electric/v1/shape`,
				params: {
					table: '"EmailAddresses"',
					where: `"workspaceId" = $1 AND "deleted_at" IS NULL`,
					'params[1]': workspaceId,
				},
				onError: (error: Error) => {
					console.error('[Electric Sync] Error syncing EmailAddresses:', error);
				},
			},
		}),
	);
}

/**
 * Factory function to create and cache an EmailAddresses collection for a workspace.
 * Used by ElectricPreSyncProvider to pre-sync all workspaces on app load.
 *
 * @returns The collection and whether it was newly created
 */
export function createEmailAddressesCollectionForWorkspace(
	workspaceId: string,
	baseUrl: string,
): { collection: EmailAddressesCollectionType; isNew: boolean } {
	const cached = emailAddressesCollectionCache.get(workspaceId);
	if (cached) {
		return { collection: cached, isNew: false };
	}

	const collection = createEmailAddressesCollectionInternal(workspaceId, baseUrl);
	emailAddressesCollectionCache.set(workspaceId, collection);
	console.log(
		'[EmailAddresses Collection] Created collection for workspace:',
		workspaceId,
	);
	return { collection, isNew: true };
}

/**
 * Get an EmailAddresses collection from cache (does not create if missing)
 */
export function getEmailAddressesCollectionFromCache(
	workspaceId: string,
): EmailAddressesCollectionType | undefined {
	return emailAddressesCollectionCache.get(workspaceId);
}

/**
 * Hook to get the EmailAddresses collection for the current workspace.
 * The collection should already be pre-synced by ElectricPreSyncProvider.
 * Returns null if not yet available (pre-sync still in progress).
 */
export function useEmailAddressesCollection(): EmailAddressesCollectionType | null {
	const { workspace } = useWorkspace();
	const [isClient, setIsClient] = useState(false);
	const [, forceUpdate] = useState(0);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// Poll for collection availability if not yet cached
	useEffect(() => {
		if (!isClient) return;

		const cached = emailAddressesCollectionCache.get(workspace.id);
		if (cached) return;

		// Poll every 100ms until collection is available
		const interval = setInterval(() => {
			if (emailAddressesCollectionCache.has(workspace.id)) {
				forceUpdate(n => n + 1);
				clearInterval(interval);
			}
		}, 100);

		return () => clearInterval(interval);
	}, [workspace.id, isClient]);

	// Only read from cache - pre-sync provider handles creation
	if (!isClient) return null;
	return emailAddressesCollectionCache.get(workspace.id) ?? null;
}

/**
 * Utility to clear the collection cache (useful for logout)
 */
export function clearEmailAddressesCollectionCache() {
	emailAddressesCollectionCache.clear();
}

/**
 * Get the collection cache (for sync status tracking)
 */
export function getEmailAddressesCollectionCache() {
	return emailAddressesCollectionCache;
}

export type { EmailAddressesCollectionType };

'use client';

import { useEffect, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import { createCollection } from '@tanstack/react-db';
import { z } from 'zod/v4';

/**
 * Zod schema for Bio data synced from Electric
 * Note: Electric returns snake_case column names from PostgreSQL
 */
const bioSyncSchema = z.object({
	id: z.string(),
	created_at: z.string(), // Electric returns as string timestamp
	updated_at: z.string(),
	deleted_at: z.string().nullable(),
	archived_at: z.string().nullable(),
	workspaceId: z.string(),
	handle: z.string(),
	key: z.string(),
	// Bio-specific settings
	imgShape: z.string().nullable(),
	socialDisplay: z.boolean(),
	showLocation: z.boolean(),
	showHeader: z.boolean(),
	headerStyle: z.string(),
	showShareButton: z.boolean(),
	showSubscribeButton: z.boolean(),
	barelyBranding: z.boolean(),
	// Email capture
	emailCaptureEnabled: z.boolean(),
	emailCaptureIncentiveText: z.string().nullable(),
	// Layout
	hasTwoPanel: z.boolean(),
	// SEO
	title: z.string().nullable(),
	description: z.string().nullable(),
	noindex: z.boolean().nullable(),
});

export type BioSync = z.infer<typeof bioSyncSchema>;

// Cache for collection instances to avoid recreation
type BiosCollectionType = ReturnType<typeof createBiosCollectionInternal>;
const biosCollectionCache = new Map<string, BiosCollectionType>();

/**
 * Internal function to create a Bios collection for a specific workspace
 */
function createBiosCollectionInternal(workspaceId: string, baseUrl: string) {
	return createCollection(
		electricCollectionOptions({
			id: `bios-${workspaceId}`,
			schema: bioSyncSchema,
			getKey: (item: BioSync) => item.id,
			shapeOptions: {
				url: `${baseUrl}/api/electric/v1/shape`,
				params: {
					table: '"Bios"',
					where: `"workspaceId" = $1 AND "deleted_at" IS NULL`,
					'params[1]': workspaceId,
				},
				onError: (error: Error) => {
					console.error('[Electric Sync] Error syncing Bios:', error);
				},
			},
		}),
	);
}

/**
 * Factory function to create and cache a Bios collection for a workspace.
 * Used by ElectricPreSyncProvider to pre-sync all workspaces on app load.
 *
 * @returns The collection and whether it was newly created
 */
export function createBiosCollectionForWorkspace(
	workspaceId: string,
	baseUrl: string,
): { collection: BiosCollectionType; isNew: boolean } {
	const cached = biosCollectionCache.get(workspaceId);
	if (cached) {
		return { collection: cached, isNew: false };
	}

	const collection = createBiosCollectionInternal(workspaceId, baseUrl);
	biosCollectionCache.set(workspaceId, collection);
	console.log('[Bios Collection] Created collection for workspace:', workspaceId);
	return { collection, isNew: true };
}

/**
 * Get a Bios collection from cache (does not create if missing)
 */
export function getBiosCollectionFromCache(
	workspaceId: string,
): BiosCollectionType | undefined {
	return biosCollectionCache.get(workspaceId);
}

/**
 * Hook to get the Bios collection for the current workspace.
 * The collection should already be pre-synced by ElectricPreSyncProvider.
 * Returns null if not yet available (pre-sync still in progress).
 */
export function useBiosCollection(): BiosCollectionType | null {
	const { workspace } = useWorkspace();
	const [isClient, setIsClient] = useState(false);
	const [, forceUpdate] = useState(0);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// Poll for collection availability if not yet cached
	useEffect(() => {
		if (!isClient) return;

		const cached = biosCollectionCache.get(workspace.id);
		if (cached) return;

		// Poll every 100ms until collection is available
		const interval = setInterval(() => {
			if (biosCollectionCache.has(workspace.id)) {
				forceUpdate(n => n + 1);
				clearInterval(interval);
			}
		}, 100);

		return () => clearInterval(interval);
	}, [workspace.id, isClient]);

	// Only read from cache - pre-sync provider handles creation
	if (!isClient) return null;
	return biosCollectionCache.get(workspace.id) ?? null;
}

/**
 * Utility to clear the collection cache (useful for logout)
 */
export function clearBiosCollectionCache() {
	biosCollectionCache.clear();
}

/**
 * Get the collection cache (for sync status tracking)
 */
export function getBiosCollectionCache() {
	return biosCollectionCache;
}

export type { BiosCollectionType };

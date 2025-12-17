'use client';

import { useEffect, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import { createCollection } from '@tanstack/react-db';
import { z } from 'zod/v4';

/**
 * Zod schema for FanGroup data synced from Electric
 * Note: Electric returns snake_case column names from PostgreSQL
 */
const fanGroupSyncSchema = z.object({
	id: z.string(),
	created_at: z.string(), // Electric returns as string timestamp
	updated_at: z.string(),
	deleted_at: z.string().nullable(),
	archived_at: z.string().nullable(),
	workspaceId: z.string(),
	// Group info
	name: z.string(),
	description: z.string().nullable(),
});

export type FanGroupSync = z.infer<typeof fanGroupSyncSchema>;

// Cache for collection instances to avoid recreation
type FanGroupsCollectionType = ReturnType<typeof createFanGroupsCollectionInternal>;
const fanGroupsCollectionCache = new Map<string, FanGroupsCollectionType>();

/**
 * Internal function to create a FanGroups collection for a specific workspace
 */
function createFanGroupsCollectionInternal(workspaceId: string, baseUrl: string) {
	return createCollection(
		electricCollectionOptions({
			id: `fan-groups-${workspaceId}`,
			schema: fanGroupSyncSchema,
			getKey: (item: FanGroupSync) => item.id,
			shapeOptions: {
				url: `${baseUrl}/api/electric/v1/shape`,
				params: {
					table: '"FanGroups"',
					where: `"workspaceId" = $1 AND "deleted_at" IS NULL`,
					'params[1]': workspaceId,
				},
				onError: (error: Error) => {
					console.error('[Electric Sync] Error syncing FanGroups:', error);
				},
			},
		}),
	);
}

/**
 * Factory function to create and cache a FanGroups collection for a workspace.
 * Used by ElectricPreSyncProvider to pre-sync all workspaces on app load.
 *
 * @returns The collection and whether it was newly created
 */
export function createFanGroupsCollectionForWorkspace(
	workspaceId: string,
	baseUrl: string,
): { collection: FanGroupsCollectionType; isNew: boolean } {
	const cached = fanGroupsCollectionCache.get(workspaceId);
	if (cached) {
		return { collection: cached, isNew: false };
	}

	const collection = createFanGroupsCollectionInternal(workspaceId, baseUrl);
	fanGroupsCollectionCache.set(workspaceId, collection);
	console.log('[FanGroups Collection] Created collection for workspace:', workspaceId);
	return { collection, isNew: true };
}

/**
 * Get a FanGroups collection from cache (does not create if missing)
 */
export function getFanGroupsCollectionFromCache(
	workspaceId: string,
): FanGroupsCollectionType | undefined {
	return fanGroupsCollectionCache.get(workspaceId);
}

/**
 * Hook to get the FanGroups collection for the current workspace.
 * The collection should already be pre-synced by ElectricPreSyncProvider.
 * Returns null if not yet available (pre-sync still in progress).
 */
export function useFanGroupsCollection(): FanGroupsCollectionType | null {
	const { workspace } = useWorkspace();
	const [isClient, setIsClient] = useState(false);
	const [, forceUpdate] = useState(0);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// Poll for collection availability if not yet cached
	useEffect(() => {
		if (!isClient) return;

		const cached = fanGroupsCollectionCache.get(workspace.id);
		if (cached) return;

		// Poll every 100ms until collection is available
		const interval = setInterval(() => {
			if (fanGroupsCollectionCache.has(workspace.id)) {
				forceUpdate(n => n + 1);
				clearInterval(interval);
			}
		}, 100);

		return () => clearInterval(interval);
	}, [workspace.id, isClient]);

	// Only read from cache - pre-sync provider handles creation
	if (!isClient) return null;
	return fanGroupsCollectionCache.get(workspace.id) ?? null;
}

/**
 * Utility to clear the collection cache (useful for logout)
 */
export function clearFanGroupsCollectionCache() {
	fanGroupsCollectionCache.clear();
}

/**
 * Get the collection cache (for sync status tracking)
 */
export function getFanGroupsCollectionCache() {
	return fanGroupsCollectionCache;
}

export type { FanGroupsCollectionType };

'use client';

import { useEffect, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import { createCollection } from '@tanstack/react-db';
import { z } from 'zod/v4';

/**
 * Zod schema for VipSwap data synced from Electric
 * Note: Electric returns snake_case column names from PostgreSQL
 */
const vipSwapSyncSchema = z.object({
	id: z.string(),
	created_at: z.string(), // Electric returns as string timestamp
	updated_at: z.string(),
	deleted_at: z.string().nullable(),
	archived_at: z.string().nullable(),
	workspaceId: z.string(),
	handle: z.string(),
	// Basic info
	name: z.string(),
	key: z.string(),
	type: z.string(), // 'contact' | 'presave' | 'presave-forever'
	description: z.string().nullable(),
	// Files
	fileId: z.string(),
	coverImageId: z.string().nullable(),
	// Email capture settings
	emailCaptureTitle: z.string().nullable(),
	emailCaptureDescription: z.string().nullable(),
	emailCaptureLabel: z.string().nullable(),
	// Download page settings
	downloadTitle: z.string().nullable(),
	// Email settings
	emailFromName: z.string().nullable(),
	emailSubject: z.string().nullable(),
	emailBody: z.string().nullable(),
	// Status
	isActive: z.boolean(),
	expiresAt: z.string().nullable(),
	// Stats
	downloadCount: z.number(),
	emailCount: z.number(),
	pageViewCount: z.number(),
	// Attribution
	cartProductId: z.string().nullable(),
	marketingCampaignId: z.string().nullable(),
	// Security
	downloadLimit: z.number().nullable(),
	passwordProtected: z.boolean(),
	password: z.string().nullable(),
	downloadLinkExpiryMinutes: z.number().nullable(),
});

export type VipSwapSync = z.infer<typeof vipSwapSyncSchema>;

// Cache for collection instances to avoid recreation
type VipSwapsCollectionType = ReturnType<typeof createVipSwapsCollectionInternal>;
const vipSwapsCollectionCache = new Map<string, VipSwapsCollectionType>();

/**
 * Internal function to create a VipSwaps collection for a specific workspace
 */
function createVipSwapsCollectionInternal(workspaceId: string, baseUrl: string) {
	return createCollection(
		electricCollectionOptions({
			id: `vip-swaps-${workspaceId}`,
			schema: vipSwapSyncSchema,
			getKey: (item: VipSwapSync) => item.id,
			shapeOptions: {
				url: `${baseUrl}/api/electric/v1/shape`,
				params: {
					table: '"VipSwaps"',
					where: `"workspaceId" = $1 AND "deleted_at" IS NULL`,
					'params[1]': workspaceId,
				},
				onError: (error: Error) => {
					console.error('[Electric Sync] Error syncing VipSwaps:', error);
				},
			},
		}),
	);
}

/**
 * Factory function to create and cache a VipSwaps collection for a workspace.
 * Used by ElectricPreSyncProvider to pre-sync all workspaces on app load.
 *
 * @returns The collection and whether it was newly created
 */
export function createVipSwapsCollectionForWorkspace(
	workspaceId: string,
	baseUrl: string,
): { collection: VipSwapsCollectionType; isNew: boolean } {
	const cached = vipSwapsCollectionCache.get(workspaceId);
	if (cached) {
		return { collection: cached, isNew: false };
	}

	const collection = createVipSwapsCollectionInternal(workspaceId, baseUrl);
	vipSwapsCollectionCache.set(workspaceId, collection);
	console.log('[VipSwaps Collection] Created collection for workspace:', workspaceId);
	return { collection, isNew: true };
}

/**
 * Get a VipSwaps collection from cache (does not create if missing)
 */
export function getVipSwapsCollectionFromCache(
	workspaceId: string,
): VipSwapsCollectionType | undefined {
	return vipSwapsCollectionCache.get(workspaceId);
}

/**
 * Hook to get the VipSwaps collection for the current workspace.
 * The collection should already be pre-synced by ElectricPreSyncProvider.
 * Returns null if not yet available (pre-sync still in progress).
 */
export function useVipSwapsCollection(): VipSwapsCollectionType | null {
	const { workspace } = useWorkspace();
	const [isClient, setIsClient] = useState(false);
	const [, forceUpdate] = useState(0);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// Poll for collection availability if not yet cached
	useEffect(() => {
		if (!isClient) return;

		const cached = vipSwapsCollectionCache.get(workspace.id);
		if (cached) return;

		// Poll every 100ms until collection is available
		const interval = setInterval(() => {
			if (vipSwapsCollectionCache.has(workspace.id)) {
				forceUpdate(n => n + 1);
				clearInterval(interval);
			}
		}, 100);

		return () => clearInterval(interval);
	}, [workspace.id, isClient]);

	// Only read from cache - pre-sync provider handles creation
	if (!isClient) return null;
	return vipSwapsCollectionCache.get(workspace.id) ?? null;
}

/**
 * Utility to clear the collection cache (useful for logout)
 */
export function clearVipSwapsCollectionCache() {
	vipSwapsCollectionCache.clear();
}

/**
 * Get the collection cache (for sync status tracking)
 */
export function getVipSwapsCollectionCache() {
	return vipSwapsCollectionCache;
}

export type { VipSwapsCollectionType };

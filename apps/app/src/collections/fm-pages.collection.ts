'use client';

import { useEffect, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import { createCollection } from '@tanstack/react-db';
import { z } from 'zod/v4';

/**
 * Zod schema for FM Page data synced from Electric
 * Note: Electric returns snake_case column names from PostgreSQL
 */
const fmPageSyncSchema = z.object({
	id: z.string(),
	created_at: z.string(), // Electric returns as string timestamp
	updated_at: z.string(),
	deleted_at: z.string().nullable(),
	archived_at: z.string().nullable(),
	archived: z.boolean(),
	workspaceId: z.string(),
	handle: z.string(),
	key: z.string(),
	sourceUrl: z.string(),
	genre: z.string().nullable(),
	title: z.string(),
	coverArtId: z.string().nullable(),
	scheme: z.enum(['light', 'dark']),
	showSocial: z.boolean(),
	remarketing: z.boolean(),
	views: z.number().nullable(),
	clicks: z.number().nullable(),
	amazonMusicClicks: z.number().nullable(),
	appleMusicClicks: z.number().nullable(),
	deezerClicks: z.number().nullable(),
	itunesClicks: z.number().nullable(),
	spotifyClicks: z.number().nullable(),
	tidalClicks: z.number().nullable(),
	tiktokClicks: z.number().nullable(),
	youtubeClicks: z.number().nullable(),
	youtubeMusicClicks: z.number().nullable(),
});

export type FmPageSync = z.infer<typeof fmPageSyncSchema>;

// Cache for collection instances to avoid recreation
type FmPagesCollectionType = ReturnType<typeof createFmPagesCollectionInternal>;
const fmPagesCollectionCache = new Map<string, FmPagesCollectionType>();

/**
 * Internal function to create an FM Pages collection for a specific workspace
 */
function createFmPagesCollectionInternal(workspaceId: string, baseUrl: string) {
	return createCollection(
		electricCollectionOptions({
			id: `fm-pages-${workspaceId}`,
			schema: fmPageSyncSchema,
			getKey: (item: FmPageSync) => item.id,
			shapeOptions: {
				url: `${baseUrl}/api/electric/v1/shape`,
				params: {
					table: '"FmPages"',
					where: `"workspaceId" = $1 AND "deleted_at" IS NULL`,
					'params[1]': workspaceId,
				},
				onError: (error: Error) => {
					console.error('[Electric Sync] Error syncing FM pages:', error);
				},
			},
		}),
	);
}

/**
 * Factory function to create and cache an FM Pages collection for a workspace.
 * Used by ElectricPreSyncProvider to pre-sync all workspaces on app load.
 *
 * @returns The collection and whether it was newly created
 */
export function createFmPagesCollectionForWorkspace(
	workspaceId: string,
	baseUrl: string,
): { collection: FmPagesCollectionType; isNew: boolean } {
	const cached = fmPagesCollectionCache.get(workspaceId);
	if (cached) {
		return { collection: cached, isNew: false };
	}

	const collection = createFmPagesCollectionInternal(workspaceId, baseUrl);
	fmPagesCollectionCache.set(workspaceId, collection);
	console.log('[FM Pages Collection] Created collection for workspace:', workspaceId);
	return { collection, isNew: true };
}

/**
 * Get an FM Pages collection from cache (does not create if missing)
 */
export function getFmPagesCollectionFromCache(
	workspaceId: string,
): FmPagesCollectionType | undefined {
	return fmPagesCollectionCache.get(workspaceId);
}

/**
 * Hook to get the FM Pages collection for the current workspace.
 * The collection should already be pre-synced by ElectricPreSyncProvider.
 * Returns null if not yet available (pre-sync still in progress).
 */
export function useFmPagesCollection(): FmPagesCollectionType | null {
	const { workspace } = useWorkspace();
	const [isClient, setIsClient] = useState(false);
	const [, forceUpdate] = useState(0);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// Poll for collection availability if not yet cached
	useEffect(() => {
		if (!isClient) return;

		const cached = fmPagesCollectionCache.get(workspace.id);
		if (cached) return;

		// Poll every 100ms until collection is available
		const interval = setInterval(() => {
			if (fmPagesCollectionCache.has(workspace.id)) {
				forceUpdate(n => n + 1);
				clearInterval(interval);
			}
		}, 100);

		return () => clearInterval(interval);
	}, [workspace.id, isClient]);

	// Only read from cache - pre-sync provider handles creation
	if (!isClient) return null;
	return fmPagesCollectionCache.get(workspace.id) ?? null;
}

/**
 * Utility to clear the collection cache (useful for logout)
 */
export function clearFmPagesCollectionCache() {
	fmPagesCollectionCache.clear();
}

/**
 * Get the collection cache (for sync status tracking)
 */
export function getFmPagesCollectionCache() {
	return fmPagesCollectionCache;
}

export type { FmPagesCollectionType };

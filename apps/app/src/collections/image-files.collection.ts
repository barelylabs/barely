'use client';

import { useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import { createCollection } from '@tanstack/react-db';
import { z } from 'zod/v4';

/**
 * Zod schema for Image File data synced from Electric
 * Note: Electric returns snake_case column names from PostgreSQL
 */
const imageFileSyncSchema = z.object({
	id: z.string(),
	workspaceId: z.string(),
	type: z.string(), // 'image' for images
	key: z.string(), // S3 key
	src: z.string().nullable(),
	width: z.number().nullable(),
	height: z.number().nullable(),
	blurDataUrl: z.string().nullable(),
	created_at: z.string(),
	deleted_at: z.string().nullable(),
});

export type ImageFileSync = z.infer<typeof imageFileSyncSchema>;

// Cache for collection instances
type ImageFilesCollectionType = ReturnType<typeof createImageFilesCollectionInternal>;
const imageFilesCollectionCache = new Map<string, ImageFilesCollectionType>();

/**
 * Internal function to create an Image Files collection for a specific workspace
 */
function createImageFilesCollectionInternal(workspaceId: string, baseUrl: string) {
	return createCollection(
		electricCollectionOptions({
			id: `image-files-${workspaceId}`,
			schema: imageFileSyncSchema,
			getKey: (item: ImageFileSync) => item.id,
			shapeOptions: {
				url: `${baseUrl}/api/electric/v1/shape`,
				params: {
					table: '"Files"',
					where: `"workspaceId" = $1 AND "deleted_at" IS NULL AND "type" = $2`,
					'params[1]': workspaceId,
					'params[2]': 'image',
				},
				onError: (error: Error) => {
					console.error('[Electric Sync] Error syncing image files:', error);
				},
			},
		}),
	);
}

/**
 * Factory function to create and cache an Image Files collection for a workspace.
 */
export function createImageFilesCollectionForWorkspace(
	workspaceId: string,
	baseUrl: string,
): { collection: ImageFilesCollectionType; isNew: boolean } {
	const cached = imageFilesCollectionCache.get(workspaceId);
	if (cached) {
		return { collection: cached, isNew: false };
	}

	const collection = createImageFilesCollectionInternal(workspaceId, baseUrl);
	imageFilesCollectionCache.set(workspaceId, collection);
	console.log('[Image Files Collection] Created collection for workspace:', workspaceId);
	return { collection, isNew: true };
}

/**
 * Get an Image Files collection from cache (does not create if missing)
 */
export function getImageFilesCollectionFromCache(
	workspaceId: string,
): ImageFilesCollectionType | undefined {
	return imageFilesCollectionCache.get(workspaceId);
}

/**
 * Hook to get the Image Files collection for the current workspace.
 */
export function useImageFilesCollection(): ImageFilesCollectionType | null {
	const { workspace } = useWorkspace();
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	const collection = useMemo(() => {
		if (!isClient) {
			return null;
		}

		// Try to get from cache first
		const cached = imageFilesCollectionCache.get(workspace.id);
		if (cached) {
			return cached;
		}

		// Fallback: create collection if not pre-synced
		const baseUrl = window.location.origin;
		try {
			const { collection } = createImageFilesCollectionForWorkspace(workspace.id, baseUrl);
			return collection;
		} catch (error) {
			console.error('[Image Files Collection] Failed to create collection:', error);
			return null;
		}
	}, [workspace.id, isClient]);

	return collection;
}

/**
 * Utility to clear the collection cache
 */
export function clearImageFilesCollectionCache() {
	imageFilesCollectionCache.clear();
}

/**
 * Get the collection cache
 */
export function getImageFilesCollectionCache() {
	return imageFilesCollectionCache;
}

export type { ImageFilesCollectionType };


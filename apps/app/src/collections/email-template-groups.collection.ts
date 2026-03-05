'use client';

import { useEffect, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import { createCollection } from '@tanstack/react-db';
import { z } from 'zod/v4';

/**
 * Zod schema for EmailTemplateGroup data synced from Electric
 * Note: Electric returns snake_case column names from PostgreSQL
 */
const emailTemplateGroupSyncSchema = z.object({
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

export type EmailTemplateGroupSync = z.infer<typeof emailTemplateGroupSyncSchema>;

// Cache for collection instances to avoid recreation
type EmailTemplateGroupsCollectionType = ReturnType<
	typeof createEmailTemplateGroupsCollectionInternal
>;
const emailTemplateGroupsCollectionCache = new Map<
	string,
	EmailTemplateGroupsCollectionType
>();

/**
 * Internal function to create an EmailTemplateGroups collection for a specific workspace
 */
function createEmailTemplateGroupsCollectionInternal(
	workspaceId: string,
	baseUrl: string,
) {
	return createCollection(
		electricCollectionOptions({
			id: `email-template-groups-${workspaceId}`,
			schema: emailTemplateGroupSyncSchema,
			getKey: (item: EmailTemplateGroupSync) => item.id,
			shapeOptions: {
				url: `${baseUrl}/api/electric/v1/shape`,
				params: {
					table: '"EmailTemplateGroups"',
					where: `"workspaceId" = $1 AND "deleted_at" IS NULL`,
					'params[1]': workspaceId,
				},
				onError: (error: Error) => {
					console.error('[Electric Sync] Error syncing EmailTemplateGroups:', error);
				},
			},
		}),
	);
}

/**
 * Factory function to create and cache an EmailTemplateGroups collection for a workspace.
 * Used by ElectricPreSyncProvider to pre-sync all workspaces on app load.
 *
 * @returns The collection and whether it was newly created
 */
export function createEmailTemplateGroupsCollectionForWorkspace(
	workspaceId: string,
	baseUrl: string,
): { collection: EmailTemplateGroupsCollectionType; isNew: boolean } {
	const cached = emailTemplateGroupsCollectionCache.get(workspaceId);
	if (cached) {
		return { collection: cached, isNew: false };
	}

	const collection = createEmailTemplateGroupsCollectionInternal(workspaceId, baseUrl);
	emailTemplateGroupsCollectionCache.set(workspaceId, collection);
	console.log(
		'[EmailTemplateGroups Collection] Created collection for workspace:',
		workspaceId,
	);
	return { collection, isNew: true };
}

/**
 * Get an EmailTemplateGroups collection from cache (does not create if missing)
 */
export function getEmailTemplateGroupsCollectionFromCache(
	workspaceId: string,
): EmailTemplateGroupsCollectionType | undefined {
	return emailTemplateGroupsCollectionCache.get(workspaceId);
}

/**
 * Hook to get the EmailTemplateGroups collection for the current workspace.
 * The collection should already be pre-synced by ElectricPreSyncProvider.
 * Returns null if not yet available (pre-sync still in progress).
 */
export function useEmailTemplateGroupsCollection(): EmailTemplateGroupsCollectionType | null {
	const { workspace } = useWorkspace();
	const [isClient, setIsClient] = useState(false);
	const [, forceUpdate] = useState(0);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// Poll for collection availability if not yet cached
	useEffect(() => {
		if (!isClient) return;

		const cached = emailTemplateGroupsCollectionCache.get(workspace.id);
		if (cached) return;

		// Poll every 100ms until collection is available
		const interval = setInterval(() => {
			if (emailTemplateGroupsCollectionCache.has(workspace.id)) {
				forceUpdate(n => n + 1);
				clearInterval(interval);
			}
		}, 100);

		return () => clearInterval(interval);
	}, [workspace.id, isClient]);

	// Only read from cache - pre-sync provider handles creation
	if (!isClient) return null;
	return emailTemplateGroupsCollectionCache.get(workspace.id) ?? null;
}

/**
 * Utility to clear the collection cache (useful for logout)
 */
export function clearEmailTemplateGroupsCollectionCache() {
	emailTemplateGroupsCollectionCache.clear();
}

/**
 * Get the collection cache (for sync status tracking)
 */
export function getEmailTemplateGroupsCollectionCache() {
	return emailTemplateGroupsCollectionCache;
}

export type { EmailTemplateGroupsCollectionType };

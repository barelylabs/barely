'use client';

import { useEffect, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import { createCollection } from '@tanstack/react-db';
import { z } from 'zod/v4';

/**
 * Zod schema for EmailBroadcast data synced from Electric
 * Note: Electric returns snake_case column names from PostgreSQL
 */
const emailBroadcastSyncSchema = z.object({
	id: z.string(),
	created_at: z.string(), // Electric returns as string timestamp
	updated_at: z.string(),
	deleted_at: z.string().nullable(),
	archived_at: z.string().nullable(),
	workspaceId: z.string(),
	// Relations
	emailTemplateId: z.string(),
	fanGroupId: z.string().nullable(),
	// Status
	status: z.string(), // 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
	scheduledAt: z.string().nullable(),
	sentAt: z.string().nullable(),
	// Error handling
	error: z.string().nullable(),
	triggerRunId: z.string().nullable(),
	// Stats
	deliveries: z.number().nullable(),
	opens: z.number().nullable(),
	clicks: z.number().nullable(),
	value: z.number().nullable(),
});

export type EmailBroadcastSync = z.infer<typeof emailBroadcastSyncSchema>;

// Cache for collection instances to avoid recreation
type EmailBroadcastsCollectionType = ReturnType<
	typeof createEmailBroadcastsCollectionInternal
>;
const emailBroadcastsCollectionCache = new Map<string, EmailBroadcastsCollectionType>();

/**
 * Internal function to create an EmailBroadcasts collection for a specific workspace
 */
function createEmailBroadcastsCollectionInternal(workspaceId: string, baseUrl: string) {
	return createCollection(
		electricCollectionOptions({
			id: `email-broadcasts-${workspaceId}`,
			schema: emailBroadcastSyncSchema,
			getKey: (item: EmailBroadcastSync) => item.id,
			shapeOptions: {
				url: `${baseUrl}/api/electric/v1/shape`,
				params: {
					table: '"EmailBroadcasts"',
					where: `"workspaceId" = $1 AND "deleted_at" IS NULL`,
					'params[1]': workspaceId,
				},
				onError: (error: Error) => {
					console.error('[Electric Sync] Error syncing EmailBroadcasts:', error);
				},
			},
		}),
	);
}

/**
 * Factory function to create and cache an EmailBroadcasts collection for a workspace.
 * Used by ElectricPreSyncProvider to pre-sync all workspaces on app load.
 *
 * @returns The collection and whether it was newly created
 */
export function createEmailBroadcastsCollectionForWorkspace(
	workspaceId: string,
	baseUrl: string,
): { collection: EmailBroadcastsCollectionType; isNew: boolean } {
	const cached = emailBroadcastsCollectionCache.get(workspaceId);
	if (cached) {
		return { collection: cached, isNew: false };
	}

	const collection = createEmailBroadcastsCollectionInternal(workspaceId, baseUrl);
	emailBroadcastsCollectionCache.set(workspaceId, collection);
	console.log(
		'[EmailBroadcasts Collection] Created collection for workspace:',
		workspaceId,
	);
	return { collection, isNew: true };
}

/**
 * Get an EmailBroadcasts collection from cache (does not create if missing)
 */
export function getEmailBroadcastsCollectionFromCache(
	workspaceId: string,
): EmailBroadcastsCollectionType | undefined {
	return emailBroadcastsCollectionCache.get(workspaceId);
}

/**
 * Hook to get the EmailBroadcasts collection for the current workspace.
 * The collection should already be pre-synced by ElectricPreSyncProvider.
 * Returns null if not yet available (pre-sync still in progress).
 */
export function useEmailBroadcastsCollection(): EmailBroadcastsCollectionType | null {
	const { workspace } = useWorkspace();
	const [isClient, setIsClient] = useState(false);
	const [, forceUpdate] = useState(0);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// Poll for collection availability if not yet cached
	useEffect(() => {
		if (!isClient) return;

		const cached = emailBroadcastsCollectionCache.get(workspace.id);
		if (cached) return;

		// Poll every 100ms until collection is available
		const interval = setInterval(() => {
			if (emailBroadcastsCollectionCache.has(workspace.id)) {
				forceUpdate(n => n + 1);
				clearInterval(interval);
			}
		}, 100);

		return () => clearInterval(interval);
	}, [workspace.id, isClient]);

	// Only read from cache - pre-sync provider handles creation
	if (!isClient) return null;
	return emailBroadcastsCollectionCache.get(workspace.id) ?? null;
}

/**
 * Utility to clear the collection cache (useful for logout)
 */
export function clearEmailBroadcastsCollectionCache() {
	emailBroadcastsCollectionCache.clear();
}

/**
 * Get the collection cache (for sync status tracking)
 */
export function getEmailBroadcastsCollectionCache() {
	return emailBroadcastsCollectionCache;
}

export type { EmailBroadcastsCollectionType };

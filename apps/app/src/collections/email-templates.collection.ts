'use client';

import { useEffect, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import { createCollection } from '@tanstack/react-db';
import { z } from 'zod/v4';

/**
 * Zod schema for EmailTemplate data synced from Electric
 * Note: Electric returns snake_case column names from PostgreSQL
 */
const emailTemplateSyncSchema = z.object({
	id: z.string(),
	created_at: z.string(), // Electric returns as string timestamp
	updated_at: z.string(),
	deleted_at: z.string().nullable(),
	archived_at: z.string().nullable(),
	workspaceId: z.string(),
	// Template info
	fromId: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	type: z.string(), // 'marketing' | 'transactional'
	flowOnly: z.boolean(),
	broadcastOnly: z.boolean(),
	// Email content
	replyTo: z.string().nullable(),
	subject: z.string(),
	previewText: z.string().nullable(),
	body: z.string(),
	// Stats
	deliveries: z.number().nullable(),
	opens: z.number().nullable(),
	clicks: z.number().nullable(),
	value: z.number().nullable(),
});

export type EmailTemplateSync = z.infer<typeof emailTemplateSyncSchema>;

// Cache for collection instances to avoid recreation
type EmailTemplatesCollectionType = ReturnType<
	typeof createEmailTemplatesCollectionInternal
>;
const emailTemplatesCollectionCache = new Map<string, EmailTemplatesCollectionType>();

/**
 * Internal function to create an EmailTemplates collection for a specific workspace
 */
function createEmailTemplatesCollectionInternal(workspaceId: string, baseUrl: string) {
	return createCollection(
		electricCollectionOptions({
			id: `email-templates-${workspaceId}`,
			schema: emailTemplateSyncSchema,
			getKey: (item: EmailTemplateSync) => item.id,
			shapeOptions: {
				url: `${baseUrl}/api/electric/v1/shape`,
				params: {
					table: '"EmailTemplates"',
					where: `"workspaceId" = $1 AND "deleted_at" IS NULL`,
					'params[1]': workspaceId,
				},
				onError: (error: Error) => {
					console.error('[Electric Sync] Error syncing EmailTemplates:', error);
				},
			},
		}),
	);
}

/**
 * Factory function to create and cache an EmailTemplates collection for a workspace.
 * Used by ElectricPreSyncProvider to pre-sync all workspaces on app load.
 *
 * @returns The collection and whether it was newly created
 */
export function createEmailTemplatesCollectionForWorkspace(
	workspaceId: string,
	baseUrl: string,
): { collection: EmailTemplatesCollectionType; isNew: boolean } {
	const cached = emailTemplatesCollectionCache.get(workspaceId);
	if (cached) {
		return { collection: cached, isNew: false };
	}

	const collection = createEmailTemplatesCollectionInternal(workspaceId, baseUrl);
	emailTemplatesCollectionCache.set(workspaceId, collection);
	console.log(
		'[EmailTemplates Collection] Created collection for workspace:',
		workspaceId,
	);
	return { collection, isNew: true };
}

/**
 * Get an EmailTemplates collection from cache (does not create if missing)
 */
export function getEmailTemplatesCollectionFromCache(
	workspaceId: string,
): EmailTemplatesCollectionType | undefined {
	return emailTemplatesCollectionCache.get(workspaceId);
}

/**
 * Hook to get the EmailTemplates collection for the current workspace.
 * The collection should already be pre-synced by ElectricPreSyncProvider.
 * Returns null if not yet available (pre-sync still in progress).
 */
export function useEmailTemplatesCollection(): EmailTemplatesCollectionType | null {
	const { workspace } = useWorkspace();
	const [isClient, setIsClient] = useState(false);
	const [, forceUpdate] = useState(0);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// Poll for collection availability if not yet cached
	useEffect(() => {
		if (!isClient) return;

		const cached = emailTemplatesCollectionCache.get(workspace.id);
		if (cached) return;

		// Poll every 100ms until collection is available
		const interval = setInterval(() => {
			if (emailTemplatesCollectionCache.has(workspace.id)) {
				forceUpdate(n => n + 1);
				clearInterval(interval);
			}
		}, 100);

		return () => clearInterval(interval);
	}, [workspace.id, isClient]);

	// Only read from cache - pre-sync provider handles creation
	if (!isClient) return null;
	return emailTemplatesCollectionCache.get(workspace.id) ?? null;
}

/**
 * Utility to clear the collection cache (useful for logout)
 */
export function clearEmailTemplatesCollectionCache() {
	emailTemplatesCollectionCache.clear();
}

/**
 * Get the collection cache (for sync status tracking)
 */
export function getEmailTemplatesCollectionCache() {
	return emailTemplatesCollectionCache;
}

export type { EmailTemplatesCollectionType };

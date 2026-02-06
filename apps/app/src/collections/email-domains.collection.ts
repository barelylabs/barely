'use client';

import { useEffect, useState } from 'react';
import { useWorkspace } from '@barely/hooks';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import { createCollection } from '@tanstack/react-db';
import { z } from 'zod/v4';

/**
 * Zod schema for EmailDomain data synced from Electric
 * Note: Electric returns snake_case column names from PostgreSQL
 */
const emailDomainSyncSchema = z.object({
	id: z.string(),
	created_at: z.string(), // Electric returns as string timestamp
	updated_at: z.string(),
	deleted_at: z.string().nullable(),
	archived_at: z.string().nullable(),
	workspaceId: z.string(),
	// Domain info (note: column is 'domain' but we'll alias to 'name' in mapToApiFormat)
	domain: z.string(),
	region: z.string(), // 'us-east-1' | etc
	// Resend integration
	resendId: z.string(),
	status: z.string(), // 'pending' | 'verified' | 'failed' | 'temporary_failure' | 'not_started'
	records: z.unknown(), // JSONB - DNS records array
	// Tracking settings
	clickTracking: z.boolean(),
	openTracking: z.boolean(),
});

export type EmailDomainSync = z.infer<typeof emailDomainSyncSchema>;

// Cache for collection instances to avoid recreation
type EmailDomainsCollectionType = ReturnType<typeof createEmailDomainsCollectionInternal>;
const emailDomainsCollectionCache = new Map<string, EmailDomainsCollectionType>();

/**
 * Internal function to create an EmailDomains collection for a specific workspace
 */
function createEmailDomainsCollectionInternal(workspaceId: string, baseUrl: string) {
	return createCollection(
		electricCollectionOptions({
			id: `email-domains-${workspaceId}`,
			schema: emailDomainSyncSchema,
			getKey: (item: EmailDomainSync) => item.id,
			shapeOptions: {
				url: `${baseUrl}/api/electric/v1/shape`,
				params: {
					table: '"EmailDomains"',
					where: `"workspaceId" = $1 AND "deleted_at" IS NULL`,
					'params[1]': workspaceId,
				},
				onError: (error: Error) => {
					console.error('[Electric Sync] Error syncing EmailDomains:', error);
				},
			},
		}),
	);
}

/**
 * Factory function to create and cache an EmailDomains collection for a workspace.
 * Used by ElectricPreSyncProvider to pre-sync all workspaces on app load.
 *
 * @returns The collection and whether it was newly created
 */
export function createEmailDomainsCollectionForWorkspace(
	workspaceId: string,
	baseUrl: string,
): { collection: EmailDomainsCollectionType; isNew: boolean } {
	const cached = emailDomainsCollectionCache.get(workspaceId);
	if (cached) {
		return { collection: cached, isNew: false };
	}

	const collection = createEmailDomainsCollectionInternal(workspaceId, baseUrl);
	emailDomainsCollectionCache.set(workspaceId, collection);
	console.log('[EmailDomains Collection] Created collection for workspace:', workspaceId);
	return { collection, isNew: true };
}

/**
 * Get an EmailDomains collection from cache (does not create if missing)
 */
export function getEmailDomainsCollectionFromCache(
	workspaceId: string,
): EmailDomainsCollectionType | undefined {
	return emailDomainsCollectionCache.get(workspaceId);
}

/**
 * Hook to get the EmailDomains collection for the current workspace.
 * The collection should already be pre-synced by ElectricPreSyncProvider.
 * Returns null if not yet available (pre-sync still in progress).
 */
export function useEmailDomainsCollection(): EmailDomainsCollectionType | null {
	const { workspace } = useWorkspace();
	const [isClient, setIsClient] = useState(false);
	const [, forceUpdate] = useState(0);

	useEffect(() => {
		setIsClient(true);
	}, []);

	// Poll for collection availability if not yet cached
	useEffect(() => {
		if (!isClient) return;

		const cached = emailDomainsCollectionCache.get(workspace.id);
		if (cached) return;

		// Poll every 100ms until collection is available
		const interval = setInterval(() => {
			if (emailDomainsCollectionCache.has(workspace.id)) {
				forceUpdate(n => n + 1);
				clearInterval(interval);
			}
		}, 100);

		return () => clearInterval(interval);
	}, [workspace.id, isClient]);

	// Only read from cache - pre-sync provider handles creation
	if (!isClient) return null;
	return emailDomainsCollectionCache.get(workspace.id) ?? null;
}

/**
 * Utility to clear the collection cache (useful for logout)
 */
export function clearEmailDomainsCollectionCache() {
	emailDomainsCollectionCache.clear();
}

/**
 * Get the collection cache (for sync status tracking)
 */
export function getEmailDomainsCollectionCache() {
	return emailDomainsCollectionCache;
}

export type { EmailDomainsCollectionType };

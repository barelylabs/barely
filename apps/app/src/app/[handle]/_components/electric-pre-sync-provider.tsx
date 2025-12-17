'use client';

import type { SessionWorkspace } from '@barely/auth';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useParams, usePathname } from 'next/navigation';

import {
	createBiosCollectionForWorkspace,
	createEmailAddressesCollectionForWorkspace,
	createEmailBroadcastsCollectionForWorkspace,
	createEmailDomainsCollectionForWorkspace,
	createEmailTemplateGroupsCollectionForWorkspace,
	createEmailTemplatesCollectionForWorkspace,
	createFanGroupsCollectionForWorkspace,
	createFansCollectionForWorkspace,
	createFmPagesCollectionForWorkspace,
	createImageFilesCollectionForWorkspace,
	createInvoiceClientsCollectionForWorkspace,
	createInvoicesCollectionForWorkspace,
	createLinksCollectionForWorkspace,
	createVipSwapsCollectionForWorkspace,
} from '~/collections';

// ============================================================================
// ROUTE-TO-COLLECTION MAPPING
// ============================================================================

/**
 * Maps route segments to their required collections.
 * Each route only loads its primary collection + direct dependencies.
 */
const ROUTE_COLLECTIONS = {
	// Core pages
	fm: ['fm', 'images'], // FM pages + cover art
	bios: ['bios', 'images'], // Bios + images
	links: ['links', 'images'], // Links + images

	// Finance
	invoices: ['invoices', 'invoiceClients'],

	// Products
	'vip-swaps': ['vipSwaps', 'images'],

	// Email module (nested routes under /email/*)
	email: [
		'emailBroadcasts',
		'emailTemplates',
		'emailTemplateGroups',
		'emailDomains',
		'emailAddresses',
	],

	// Fans module
	fans: ['fans'],
	'fan-groups': ['fanGroups'],

	// Default/dashboard - core pages user likely visits
	default: ['fm', 'images'],
} as const;

type RouteSegment = keyof typeof ROUTE_COLLECTIONS;

// ============================================================================
// COLLECTION FACTORIES
// ============================================================================

/**
 * Maps collection names to their factory functions.
 * Used to dynamically create specific collections by name.
 */
const COLLECTION_FACTORIES = {
	fm: createFmPagesCollectionForWorkspace,
	images: createImageFilesCollectionForWorkspace,
	bios: createBiosCollectionForWorkspace,
	links: createLinksCollectionForWorkspace,
	invoices: createInvoicesCollectionForWorkspace,
	invoiceClients: createInvoiceClientsCollectionForWorkspace,
	vipSwaps: createVipSwapsCollectionForWorkspace,
	emailBroadcasts: createEmailBroadcastsCollectionForWorkspace,
	emailTemplates: createEmailTemplatesCollectionForWorkspace,
	emailTemplateGroups: createEmailTemplateGroupsCollectionForWorkspace,
	emailDomains: createEmailDomainsCollectionForWorkspace,
	emailAddresses: createEmailAddressesCollectionForWorkspace,
	fans: createFansCollectionForWorkspace,
	fanGroups: createFanGroupsCollectionForWorkspace,
} as const;

type CollectionName = keyof typeof COLLECTION_FACTORIES;

/**
 * All collection names, ordered by loading priority.
 * Tier 1: Core pages (most commonly used)
 * Tier 2: Secondary pages
 * Tier 3: Email module
 * Tier 4: Fans module
 */
const ALL_COLLECTIONS: CollectionName[] = [
	// Tier 1: Core
	'fm',
	'images',
	'bios',
	'links',
	// Tier 2: Secondary
	'invoices',
	'invoiceClients',
	'vipSwaps',
	// Tier 3: Email
	'emailBroadcasts',
	'emailTemplates',
	'emailTemplateGroups',
	'emailDomains',
	'emailAddresses',
	// Tier 4: Fans
	'fans',
	'fanGroups',
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse the route segment from pathname.
 * e.g., "/barelysparrow/fm/some-page" → "fm"
 */
function getRouteSegment(pathname: string, handle: string | undefined): RouteSegment {
	if (!handle) return 'default';

	const afterHandle = pathname.split(`/${handle}/`)[1];
	const segment = afterHandle?.split('/')[0];

	if (!segment) return 'default';

	// Check if it's a known route
	if (segment in ROUTE_COLLECTIONS) {
		return segment as RouteSegment;
	}

	return 'default';
}

/**
 * Stagger loading collections to avoid overwhelming connections.
 * Loads in batches with a small delay between each batch.
 */
async function staggeredPreload(
	collections: { name: string; preload: () => Promise<void> }[],
	_workspaceHandle: string,
	batchSize = 2,
	delayMs = 50,
) {
	for (let i = 0; i < collections.length; i += batchSize) {
		const batch = collections.slice(i, i + batchSize);
		await Promise.all(
			batch.map(({ preload }) =>
				preload().catch((err: Error) => {
					console.debug('[Electric] Collection preload error (suppressed):', err.message);
				}),
			),
		);
		// Small delay between batches to avoid connection storms
		if (i + batchSize < collections.length) {
			await new Promise(resolve => setTimeout(resolve, delayMs));
		}
	}
}

// Track which workspaces have been fully initialized (all collections)
const fullyInitializedWorkspaces = new Set<string>();

// Track which specific collections have been initialized per workspace
const initializedCollections = new Map<string, Set<CollectionName>>();

/**
 * Get or create the set of initialized collections for a workspace.
 */
function getInitializedCollections(workspaceId: string): Set<CollectionName> {
	let collections = initializedCollections.get(workspaceId);
	if (!collections) {
		collections = new Set();
		initializedCollections.set(workspaceId, collections);
	}
	return collections;
}

/**
 * Create and preload specific collections for a workspace.
 * Only creates collections that haven't been initialized yet.
 */
async function preloadCollections(
	workspaceId: string,
	workspaceHandle: string,
	collectionNames: readonly CollectionName[],
	baseUrl: string,
) {
	const initialized = getInitializedCollections(workspaceId);
	const toLoad: { name: string; preload: () => Promise<void> }[] = [];

	for (const name of collectionNames) {
		if (initialized.has(name)) continue;

		const factory = COLLECTION_FACTORIES[name];
		const { collection } = factory(workspaceId, baseUrl);
		initialized.add(name);
		toLoad.push({ name, preload: () => collection.preload() });
	}

	if (toLoad.length > 0) {
		await staggeredPreload(toLoad, workspaceHandle);
	}
}

/**
 * Create and preload ALL collections for a workspace (tiered loading).
 */
async function preloadAllCollections(
	workspaceId: string,
	workspaceHandle: string,
	baseUrl: string,
) {
	if (fullyInitializedWorkspaces.has(workspaceId)) {
		return; // Already fully initialized
	}

	// Load all collections in priority order
	await preloadCollections(workspaceId, workspaceHandle, ALL_COLLECTIONS, baseUrl);

	fullyInitializedWorkspaces.add(workspaceId);
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface ElectricPreSyncProviderProps {
	workspaces: SessionWorkspace[];
	children: ReactNode;
}

/**
 * Provider that pre-syncs Electric collections with SMART LOADING strategy.
 *
 * Strategy:
 * 1. PHASE 1: Current workspace - ALL collections (staggered by priority)
 * 2. PHASE 2: Other workspaces - only route-relevant collections
 *
 * This optimizes for:
 * - Fast deep navigation within current workspace (all data ready)
 * - Fast workspace switching on current page (that page's data ready)
 * - Reasonable connection count (avoids HTTP/1.1 6-connection limit)
 *
 * NOTE: For best performance in dev, use Caddy with HTTP/2.
 */
export function ElectricPreSyncProvider({
	workspaces,
	children,
}: ElectricPreSyncProviderProps) {
	const params = useParams();
	const pathname = usePathname();
	const hasInitialized = useRef(false);

	const handle = params.handle as string | undefined;

	// Find current and other workspaces
	const currentWorkspace = useMemo(
		() => workspaces.find(w => w.handle === handle),
		[workspaces, handle],
	);

	// Limit other workspaces to first 3 to avoid too many connections
	const otherWorkspaces = useMemo(
		() => workspaces.filter(w => w.handle !== handle).slice(0, 3),
		[workspaces, handle],
	);

	// Determine current route segment
	const routeSegment = useMemo(
		() => getRouteSegment(pathname, handle),
		[pathname, handle],
	);

	const routeCollections = ROUTE_COLLECTIONS[routeSegment];

	const preload = useCallback(async () => {
		const baseUrl = window.location.origin;

		// Phase 1: Current workspace - ALL collections
		if (currentWorkspace) {
			await preloadAllCollections(currentWorkspace.id, currentWorkspace.handle, baseUrl);
		}

		// Phase 2: Other workspaces - only route-relevant collections
		for (const workspace of otherWorkspaces) {
			await preloadCollections(workspace.id, workspace.handle, routeCollections, baseUrl);
		}
	}, [currentWorkspace, otherWorkspaces, routeCollections]);

	// Initial preload on mount
	useEffect(() => {
		if (hasInitialized.current) return;
		hasInitialized.current = true;
		void preload();
	}, [preload]);

	// Route-change preloading disabled - hooks create collections on-demand
	// useEffect(() => {
	// 	if (!hasInitialized.current) return;
	// 	const baseUrl = window.location.origin;
	// 	for (const workspace of otherWorkspaces) {
	// 		void preloadCollections(workspace.id, workspace.handle, routeCollections, baseUrl);
	// 	}
	// }, [routeSegment, otherWorkspaces, routeCollections]);

	return <>{children}</>;
}

// ============================================================================
// EXPORTED HOOKS
// ============================================================================

/**
 * Hook to manually trigger preload for a workspace (e.g., on hover over workspace switcher).
 * Loads all collections for the workspace.
 */
export function usePreloadWorkspace() {
	return useCallback((workspaceId: string, workspaceHandle: string) => {
		if (fullyInitializedWorkspaces.has(workspaceId)) {
			return; // Already fully initialized
		}

		const baseUrl = window.location.origin;
		void preloadAllCollections(workspaceId, workspaceHandle, baseUrl);
	}, []);
}

/**
 * Placeholder hook for sync state (can be expanded to track actual sync progress)
 */
export function useElectricSyncState() {
	return {
		isSyncing: false,
		syncProgress: {
			total: 0,
			ready: 0,
			percentage: 100,
		},
	};
}

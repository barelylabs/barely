'use client';

import type { SessionWorkspace } from '@barely/auth';
import type { ReactNode } from 'react';
import type { FmPagesCollectionType, ImageFilesCollectionType } from '~/collections';
import { useEffect, useRef } from 'react';

import {
	createFmPagesCollectionForWorkspace,
	createImageFilesCollectionForWorkspace,
} from '~/collections';

interface ElectricPreSyncProviderProps {
	workspaces: SessionWorkspace[];
	children: ReactNode;
}

interface WorkspaceCollections {
	workspaceId: string;
	fm: FmPagesCollectionType;
	images: ImageFilesCollectionType;
}

/**
 * Provider that pre-syncs Electric collections for ALL user workspaces.
 * This enables instant data availability when switching between workspaces.
 *
 * NOTE: Requires HTTP/2 in local dev (e.g., via Caddy reverse proxy) to avoid
 * hitting the browser's 6-connection limit with HTTP/1.1.
 */
export function ElectricPreSyncProvider({
	workspaces,
	children,
}: ElectricPreSyncProviderProps) {
	const workspacesRef = useRef(workspaces);
	const hasInitialized = useRef(false);

	workspacesRef.current = workspaces;

	useEffect(() => {
		if (hasInitialized.current) return;
		hasInitialized.current = true;

		const ws = workspacesRef.current;
		if (ws.length === 0) return;

		const baseUrl = window.location.origin;

		console.log('[Electric Pre-Sync] Creating collections for', ws.length, 'workspaces');

		// Create collections for all workspaces
		const collections: WorkspaceCollections[] = [];

		for (const workspace of ws) {
			const fmResult = createFmPagesCollectionForWorkspace(workspace.id, baseUrl);
			const imgResult = createImageFilesCollectionForWorkspace(workspace.id, baseUrl);

			collections.push({
				workspaceId: workspace.id,
				fm: fmResult.collection,
				images: imgResult.collection,
			});
			console.log('[Electric Pre-Sync] Created collections for:', workspace.id);
		}

		// Preload all collections in parallel (HTTP/2 allows unlimited connections)
		void Promise.all(
			collections.map(({ workspaceId, fm, images }) =>
				Promise.all([
					fm
						.preload()
						.then(() => console.log('[Electric Pre-Sync] FM ready:', workspaceId))
						.catch((err: unknown) =>
							console.error(
								'[Electric Pre-Sync] FM error:',
								workspaceId,
								err instanceof Error ? err.message : err,
							),
						),
					images
						.preload()
						.then(() => console.log('[Electric Pre-Sync] Images ready:', workspaceId))
						.catch((err: unknown) =>
							console.error(
								'[Electric Pre-Sync] Images error:',
								workspaceId,
								err instanceof Error ? err.message : err,
							),
						),
				]),
			),
		).then(() => console.log('[Electric Pre-Sync] All workspaces preloaded!'));
	}, []);

	return <>{children}</>;
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

'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { createResourceDataHook, createResourceSearchParamsHook } from '@barely/hooks';

import { useTRPC } from '@barely/api/app/trpc.react';

// Define the page data type for playlists
interface PlaylistPageData {
	playlists: AppRouterOutputs['playlist']['byWorkspace']['playlists'];
	nextCursor?: { id: string; createdAt: Date } | null;
}

// Create the search params hook for playlists
export const usePlaylistSearchParams = createResourceSearchParamsHook();

// Create a custom data hook for playlists that properly uses tRPC
export function usePlaylist() {
	const trpc = useTRPC();
	const baseHook = createResourceDataHook<
		AppRouterOutputs['playlist']['byWorkspace']['playlists'][0],
		PlaylistPageData
	>(
		{
			resourceName: 'playlists',
			getQueryOptions: (handle, filters) =>
				trpc.playlist.byWorkspace.infiniteQueryOptions(
					{ handle, ...filters },
					{ getNextPageParam: (lastPage: PlaylistPageData) => lastPage.nextCursor },
				),
			getItemsFromPages: pages => pages.flatMap(page => page.playlists),
		},
		usePlaylistSearchParams,
	);

	return baseHook();
}

// Export the old context hook name for backward compatibility
export const usePlaylistContext = usePlaylist;

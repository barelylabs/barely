import { Suspense } from 'react';
import { playlistFilterParamsSchema } from '@barely/validators';

import { HydrateClient, prefetch, trpc } from '~/trpc/server';
import { DashContent } from '../_components/dash-content';
import { DashContentHeader } from '../_components/dash-content-header';
import { AllPlaylists } from './_components/all-playlists';
import { ArchiveOrDeletePlaylistModal } from './_components/archive-or-delete-playlist-modal';
import { CreateOrUpdatePlaylistModal } from './_components/create-or-update-playlist-modal';
import { CreatePlaylistButton } from './_components/create-playlist-button';
import { PlaylistFilters } from './_components/playlist-filters';
import { PlaylistHotkeys } from './_components/playlist-hotkeys';

export default async function PlaylistPage({
	params,
	searchParams,
}: {
	params: Promise<{ handle: string }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const { handle } = await params;
	const awaitedSearchParams = await searchParams;

	const parsedFilters = playlistFilterParamsSchema.safeParse(awaitedSearchParams);
	const filters = parsedFilters.success ? parsedFilters.data : {};

	// Prefetch playlists data
	prefetch(
		trpc.playlist.byWorkspace.infiniteQueryOptions(
			{ handle, ...filters },
			{
				getNextPageParam: lastPage => lastPage.nextCursor,
			},
		),
	);

	return (
		<HydrateClient>
			<DashContentHeader
				title='Playlists'
				subtitle='Manage your playlists'
				button={<CreatePlaylistButton />}
			/>
			<DashContent>
				<PlaylistFilters />
				<Suspense fallback={<div>Loading...</div>}>
					<AllPlaylists />
				</Suspense>

				<CreateOrUpdatePlaylistModal mode='create' />
				<CreateOrUpdatePlaylistModal mode='update' />
				<ArchiveOrDeletePlaylistModal mode='archive' />
				<ArchiveOrDeletePlaylistModal mode='delete' />

				<PlaylistHotkeys />
			</DashContent>
		</HydrateClient>
	);
}

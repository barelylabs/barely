'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/router';

import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';
import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { Button } from '@barely/ui/elements/button';
import { GridList, GridListCard } from '@barely/ui/elements/grid-list';
import { Img } from '@barely/ui/elements/img';
import { Text } from '@barely/ui/elements/typography';

import { CreateTrackButton } from '~/app/[handle]/tracks/_components/create-track-button';
import { useTrackContext } from '~/app/[handle]/tracks/_components/track-context';
import { TrackFilters } from '~/app/[handle]/tracks/_components/track-filters';

export function AllTracks() {
	const {
		items,
		selection,
		lastSelectedItemId,
		setSelection,
		gridListRef,
		setShowUpdateModal,
		isFetching,
		groupByAlbum,
	} = useTrackContext();

	const groupedTracks =
		groupByAlbum ?
			items.reduce(
				(acc, track) => {
					const albumName = track._albums?.[0]?.album.name ?? 'No Album';
					if (!acc[albumName]) {
						acc[albumName] = [];
					}
					acc[albumName].push(track);
					return acc;
				},
				{} as Record<string, typeof items>,
			)
		:	{ 'All Tracks': items };

	// Sort tracks by track number when grouped by album
	if (groupByAlbum) {
		Object.keys(groupedTracks).forEach(albumName => {
			groupedTracks[albumName]?.sort((a, b) => {
				const aTrackNumber = a._albums?.[0]?.trackNumber ?? 0;
				const bTrackNumber = b._albums?.[0]?.trackNumber ?? 0;
				return aTrackNumber - bTrackNumber;
			});
		});
	}

	return (
		<div className='flex flex-col gap-4'>
			<TrackFilters />
			{Object.entries(groupedTracks).map(([albumName, tracks]) => (
				<div key={albumName} className='flex flex-col gap-2'>
					{groupByAlbum && (
						<Text variant='md/semibold' className='text-blue-800'>
							{albumName}
						</Text>
					)}
					<GridList
						glRef={gridListRef}
						aria-label='Tracks'
						className='flex flex-col gap-2'
						// behavior
						selectionMode='multiple'
						selectionBehavior='replace'
						// tracks
						items={tracks}
						selectedKeys={selection}
						setSelectedKeys={setSelection}
						onAction={() => {
							if (!lastSelectedItemId) return;
							setShowUpdateModal(true);
						}}
						// empty
						renderEmptyState={() =>
							isFetching ?
								<GridListSkeleton />
							:	<NoResultsPlaceholder
									icon='track'
									title='No tracks found.'
									subtitle='Create a new track to get started.'
									button={<CreateTrackButton />}
								/>
						}
					>
						{track => <TrackCard track={track} />}
					</GridList>
				</div>
			))}
			{items.length > 0 && <LoadMoreButton />}
		</div>
	);
}

function LoadMoreButton() {
	const { hasNextPage, fetchNextPage, isFetchingNextPage } = useTrackContext();
	if (!hasNextPage)
		return (
			<div className='flex w-full justify-center'>
				<Text variant='sm/normal'>No more tracks to load.</Text>
			</div>
		);
	return (
		<Button
			look='primary'
			onClick={() => fetchNextPage()}
			loading={isFetchingNextPage}
			fullWidth
		>
			Load more tracks
		</Button>
	);
}

function TrackCard({
	track,
}: {
	track: AppRouterOutputs['track']['byWorkspace']['tracks'][number];
}) {
	const { setShowUpdateModal, setShowArchiveModal, setShowDeleteModal } =
		useTrackContext();

	return (
		<GridListCard
			id={track.id}
			key={track.id}
			textValue={track.name}
			setShowUpdateModal={setShowUpdateModal}
			setShowArchiveModal={setShowArchiveModal}
			setShowDeleteModal={setShowDeleteModal}
		>
			<div className='flex flex-grow flex-row items-center gap-4'>
				<div className='flex flex-col items-start gap-1'>
					<div className='flex flex-row items-center gap-2'>
						<Img
							src={track.artworkFiles?.find(f => f.current)?.src ?? track.imageUrl ?? ''}
							alt='Track'
							className='h-8 w-8 rounded-md bg-gray-100 sm:h-16 sm:w-16'
							width={40}
							height={40}
						/>
						<div className='flex flex-col'>
							<Text variant='md/semibold' className='text-blue-800'>
								{track.name}
							</Text>
							<div className='flex flex-row items-center gap-2'>
								<Text variant='sm/normal' className='text-muted-foreground'>
									Track {track._albums?.[0]?.trackNumber ?? '?'}
								</Text>
								{track.spotifyPopularity !== null && (
									<Text variant='sm/normal' className='text-muted-foreground'>
										• Popularity: {track.spotifyPopularity}
									</Text>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</GridListCard>
	);
}

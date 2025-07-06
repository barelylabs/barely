'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';

import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';
import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/grid-list';
import { Img } from '@barely/ui/img';
import { Text } from '@barely/ui/typography';

import { CreateTrackButton } from '~/app/[handle]/tracks/_components/create-track-button';
import {
	useTrack,
	useTrackSearchParams,
} from '~/app/[handle]/tracks/_components/track-context';

export function AllTracks() {
	const {
		items,
		selection,
		lastSelectedItemId,
		setSelection,
		gridListRef,
		isFetching,
		setShowUpdateModal,
	} = useTrack();

	return (
		<GridList
			glRef={gridListRef}
			aria-label='Tracks'
			className='flex flex-col gap-2'
			data-grid-list='tracks'
			// behavior
			selectionMode='multiple'
			selectionBehavior='replace'
			// tracks
			items={items}
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
	);
}

function TrackCard({
	track,
}: {
	track: AppRouterOutputs['track']['byWorkspace']['tracks'][number];
}) {
	const { setShowUpdateModal, setShowArchiveModal, setShowDeleteModal } =
		useTrackSearchParams();

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
							src={track.artworkFiles.find(f => f.current)?.src ?? ''}
							alt='Track'
							className='h-8 w-8 rounded-md bg-gray-100 sm:h-16 sm:w-16'
							width={40}
							height={40}
						/>
						<Text variant='md/semibold' className='text-blue-800'>
							{track.name}
						</Text>
					</div>
				</div>
			</div>
		</GridListCard>
	);
}

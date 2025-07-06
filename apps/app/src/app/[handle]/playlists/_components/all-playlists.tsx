'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import Link from 'next/link';
import { useWorkspace } from '@barely/hooks';

import { Badge } from '@barely/ui/badge';
import { Button } from '@barely/ui/button';
import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';
import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/grid-list';
import { Icon } from '@barely/ui/icon';

import { CreatePlaylistButton } from './create-playlist-button';
import { usePlaylist, usePlaylistSearchParams } from './playlist-context';

export function AllPlaylists() {
	const { setShowUpdateModal } = usePlaylistSearchParams();
	const {
		items,
		selection,
		lastSelectedItemId,
		setSelection,
		isFetching,
	} = usePlaylist();

	return (
		<>
			<GridList
				data-grid-list="playlists"
				aria-label='Playlists'
				className='flex flex-col gap-2'
				selectionMode='multiple'
				selectionBehavior='replace'
				onAction={() => {
					if (!lastSelectedItemId) return;
					setShowUpdateModal(true);
				}}
				items={items}
				selectedKeys={selection}
				setSelectedKeys={setSelection}
				renderEmptyState={() => (
					<>
						{isFetching ?
							<GridListSkeleton />
						:	<NoResultsPlaceholder
								icon='playlist'
								title='No playlists found'
								subtitle='Your synced playlists will appear here'
								button={<CreatePlaylistButton />}
							/>
						}
					</>
				)}
			>
				{item => <PlaylistCard playlist={item} />}
			</GridList>
		</>
	);
}

function PlaylistCard({
	playlist,
}: {
	playlist: AppRouterOutputs['playlist']['byWorkspace']['playlists'][0];
}) {
	const { handle } = useWorkspace();
	const { setShowUpdateModal, setShowArchiveModal, setShowDeleteModal } =
		usePlaylistSearchParams();

	const href = `/${handle}/playlists/${playlist.id}`;

	return (
		<GridListCard
			id={playlist.id}
			key={playlist.id}
			textValue={playlist.name}
			setShowUpdateModal={setShowUpdateModal}
			setShowArchiveModal={setShowArchiveModal}
			setShowDeleteModal={setShowDeleteModal}
		>
			<div className='flex flex-grow flex-row items-center gap-4'>
				{playlist.imageUrl && (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={playlist.imageUrl}
						alt={playlist.name}
						className='h-12 w-12 rounded-md object-cover'
					/>
				)}

				<div className='flex flex-1 flex-col gap-1'>
					<div className='flex items-center gap-2'>
						<p className='text-sm font-medium'>{playlist.name}</p>
						{playlist.forTesting && (
							<Badge variant='secondary' size='xs'>
								Test
							</Badge>
						)}
					</div>

					<div className='flex items-center gap-2 text-xs text-muted-foreground'>
						{playlist.providerAccounts[0]?.username && (
							<span>{playlist.providerAccounts[0].username}</span>
						)}
						{playlist.totalTracks && <span>{playlist.totalTracks} tracks</span>}
					</div>
				</div>
			</div>

			<Link href={href}>
				<Button variant='icon' look='ghost' size='sm'>
					<Icon.edit className='h-3 w-3' />
				</Button>
			</Link>
		</GridListCard>
	);
}

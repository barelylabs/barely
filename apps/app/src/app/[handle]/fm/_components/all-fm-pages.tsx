'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/router';

import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/elements/grid-list';
import { Icon } from '@barely/ui/elements/icon';
import { Text } from '@barely/ui/elements/typography';

import { CreateFmPageButton } from '~/app/[handle]/fm/_components/create-fm-page-button';
import { useFmContext } from '~/app/[handle]/fm/_components/fm-context';

export function AllFmPages() {
	const {
		fmPages,
		fmPageSelection,
		lastSelectedFmPageId,
		setFmPageSelection,
		gridListRef,
		setShowUpdateFmPageModal,
	} = useFmContext();

	return (
		<>
			<GridList
				glRef={gridListRef}
				className='flex flex-col gap-2'
				aria-label='Fm Pages'
				selectionMode='multiple'
				selectionBehavior='replace'
				onAction={() => {
					if (!lastSelectedFmPageId) return;
					setShowUpdateFmPageModal(true);
				}}
				items={fmPages}
				selectedKeys={fmPageSelection}
				setSelectedKeys={setFmPageSelection}
				renderEmptyState={() => (
					<NoResultsPlaceholder
						icon='fm'
						title='No FM Pages'
						subtitle='Create a new fm page to get started.'
						button={<CreateFmPageButton />}
					/>
				)}
			>
				{fmPage => <FmPageCard fmPage={fmPage} />}
			</GridList>
		</>
	);
}

function FmPageCard({
	fmPage,
}: {
	fmPage: AppRouterOutputs['fm']['byWorkspace']['fmPages'][0];
}) {
	const {
		setShowUpdateFmPageModal,
		setShowArchiveFmPageModal,
		setShowDeleteFmPageModal,
	} = useFmContext();

	const { coverArt } = fmPage;

	const href = `https://barely.fm/${fmPage.handle}/${fmPage.key}`;

	return (
		<GridListCard
			id={fmPage.id}
			key={fmPage.id}
			textValue={fmPage.title}
			setShowUpdateModal={setShowUpdateFmPageModal}
			setShowArchiveModal={setShowArchiveFmPageModal}
			setShowDeleteModal={setShowDeleteFmPageModal}
			img={{ ...coverArt, alt: `${fmPage.title} cover art` }}
			title={fmPage.title}
			subtitle={`${fmPage.clicks} clicks`}
			quickActions={{
				goToHref: href,
				copyText: href,
			}}
			statsRight={
				<div className='items-left flex flex-col'>
					<div className='flex flex-row items-center gap-1'>
						<Icon.spotify className='h-2.5 w-2.5' />
						<Text variant='xs/normal'>Spotify: {fmPage.spotifyClicks}</Text>
					</div>
					<div className='flex flex-row items-center gap-1'>
						<Icon.appleMusic className='h-2.5 w-2.5' />
						<Text variant='xs/normal'>Apple Music: {fmPage.appleMusicClicks}</Text>
					</div>
					<div className='flex flex-row items-center gap-1'>
						<Icon.youtube className='h-2.5 w-2.5' />
						<Text variant='xs/normal'>YouTube: {fmPage.youtubeClicks}</Text>
					</div>
					<div className='flex flex-row items-center gap-1'>
						<Icon.amazonMusic className='h-2.5 w-2.5' />
						<Text variant='xs/normal'>Amazon Music: {fmPage.amazonMusicClicks}</Text>
					</div>
				</div>
			}
		>
			{/* <div className='items-left flex flex-col'>
					<div className='flex flex-row items-center gap-1'>
						<Icon.spotify className='h-2.5 w-2.5' />
						<Text variant='xs/normal'>Spotify: {fmPage.spotifyClicks}</Text>
					</div>
					<div className='flex flex-row items-center gap-1'>
						<Icon.appleMusic className='h-2.5 w-2.5' />
						<Text variant='xs/normal'>Apple Music: {fmPage.appleMusicClicks}</Text>
					</div>
					<div className='flex flex-row items-center gap-1'>
						<Icon.youtube className='h-2.5 w-2.5' />
						<Text variant='xs/normal'>YouTube: {fmPage.youtubeClicks}</Text>
					</div>
					<div className='flex flex-row items-center gap-1'>
						<Icon.amazonMusic className='h-2.5 w-2.5' />
						<Text variant='xs/normal'>Amazon Music: {fmPage.amazonMusicClicks}</Text>
					</div>
				</div>			 */}
		</GridListCard>
	);
}

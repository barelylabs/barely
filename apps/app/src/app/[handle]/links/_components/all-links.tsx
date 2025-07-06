'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import Link from 'next/link';
import { cn, truncate } from '@barely/utils';

import { Badge } from '@barely/ui/badge';
import { BlurImage } from '@barely/ui/blur-image';
import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';
import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { CopyButton } from '@barely/ui/copy-button';
import { GridList, GridListCard } from '@barely/ui/grid-list';
import { Icon } from '@barely/ui/icon';
import { Text } from '@barely/ui/typography';

import { CreateLinkButton } from '~/app/[handle]/links/_components/create-link-button';
import { useLink } from '~/app/[handle]/links/_components/link-context';

export function AllLinks() {
	const {
		items,
		selection,
		lastSelectedItemId,
		setSelection,
		gridListRef,
		setShowUpdateModal,
		isFetching,
	} = useLink();

	return (
		<>
			<GridList
				glRef={gridListRef}
				aria-label='Links'
				data-grid-list='links'
				className='flex flex-col gap-2'
				// behavior
				selectionMode='multiple'
				selectionBehavior='replace'
				// links
				items={items.map(item => ({ ...item, key: item.id, linkKey: item.key }))}
				selectedKeys={selection}
				setSelectedKeys={setSelection}
				onAction={() => {
					if (!lastSelectedItemId) return;
					setShowUpdateModal(true);
				}}
				// empty
				renderEmptyState={() => (
					<>
						{isFetching ?
							<GridListSkeleton />
						:	<NoResultsPlaceholder
								icon='link'
								title='No links found.'
								subtitle='Create a new link to get started.'
								button={<CreateLinkButton />}
							/>
						}
					</>
				)}
			>
				{item => <LinkCard key={item.id} link={item} />}
			</GridList>
		</>
	);
}

function LinkCard({
	link,
}: {
	link: AppRouterOutputs['link']['byWorkspace']['links'][0] & { linkKey: string };
}) {
	const { setShowUpdateModal, setShowArchiveModal, setShowDeleteModal } =
		useLink();

	return (
		<GridListCard
			id={link.id}
			key={link.id}
			textValue={link.url}
			setShowUpdateModal={setShowUpdateModal}
			setShowArchiveModal={setShowArchiveModal}
			setShowDeleteModal={setShowDeleteModal}
		>
			<div className='flex flex-grow flex-row items-center gap-4'>
				{link.favicon ?
					<BlurImage
						src={link.favicon}
						alt='Link'
						className='h-8 w-8 sm:h-10 sm:w-10'
						width={20}
						height={20}
					/>
				:	<Icon.link className='h-8 w-8 sm:h-10 sm:w-10' />}

				<div className='flex flex-col items-start gap-1'>
					<div className='flex flex-row items-center gap-2'>
						<a href={`https://${link.domain}/${link.linkKey}`}>
							<Text
								variant='md/semibold'
								className='text-blue-800'
							>{`${link.domain}/${link.linkKey}`}</Text>
						</a>
						<CopyButton text={`https://${link.domain}/${link.linkKey}`} />
					</div>

					<a href={link.url} target='_blank' rel='noreferrer'>
						<Text variant='sm/medium' className='hover:underline'>
							{truncate(link.url, 50)}
						</Text>
					</a>
				</div>
			</div>

			<Link href={`/${link.handle}/links/stats?assetId=${link.id}`} passHref>
				<Badge size='md' icon={'stat'} variant='muted' shape='rectangle' asButton>
					{link.clicks} clicks
				</Badge>
			</Link>
		</GridListCard>
	);
}

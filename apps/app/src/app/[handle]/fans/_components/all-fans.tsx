'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';

import { Button } from '@barely/ui/button';
import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';
import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/grid-list';
import { Text } from '@barely/ui/typography';

import { CreateFanButton } from '~/app/[handle]/fans/_components/create-fan-button';
import { useFan } from '~/app/[handle]/fans/_components/fan-context';

export function AllFans() {
	const {
		items,
		selection,
		lastSelectedItemId,
		setSelection,
		gridListRef,
		setShowUpdateModal,
		isFetching,
	} = useFan();

	return (
		<div className='flex flex-col gap-4' data-grid-list>
			{/* <Text variant='md/medium'>{totalFans} fans</Text> */}
			<GridList
				glRef={gridListRef}
				className='flex flex-col gap-2'
				aria-label='Fans'
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
								icon='fan'
								title='No Fans'
								subtitle='Create a new fan to get started.'
								button={<CreateFanButton />}
							/>
						}
					</>
				)}
			>
				{item => <FanCard fan={item} />}
			</GridList>
			{items.length > 0 && <LoadMoreButton />}
		</div>
	);
}

function LoadMoreButton() {
	const { hasNextPage, fetchNextPage, isFetchingNextPage } = useFan();
	if (!hasNextPage)
		return (
			<div className='flex w-full justify-center'>
				<Text variant='sm/normal'>No more fans to load.</Text>
			</div>
		);
	return (
		<Button
			look='primary'
			onClick={() => fetchNextPage()}
			loading={isFetchingNextPage}
			fullWidth
		>
			Load more fans
		</Button>
	);
}

function FanCard({ fan }: { fan: AppRouterOutputs['fan']['byWorkspace']['fans'][0] }) {
	const { setShowUpdateModal, setShowDeleteModal } = useFan();

	return (
		<GridListCard
			id={fan.id}
			key={fan.id}
			textValue={fan.fullName}
			setShowUpdateModal={setShowUpdateModal}
			setShowDeleteModal={setShowDeleteModal}
		>
			<div className='flex flex-grow flex-row items-center gap-4'>
				<div className='flex flex-col gap-1'>
					<Text variant='md/medium'>{fan.fullName}</Text>
					<Text variant='sm/normal'>{fan.email}</Text>
				</div>
			</div>
		</GridListCard>
	);
}

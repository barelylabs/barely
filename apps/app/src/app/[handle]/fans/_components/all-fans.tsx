'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/router';

import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { Button } from '@barely/ui/elements/button';
import { GridList, GridListCard } from '@barely/ui/elements/grid-list';
import { Text } from '@barely/ui/elements/typography';

import { CreateFanButton } from '~/app/[handle]/fans/_components/create-fan-button';
import { useFanContext } from '~/app/[handle]/fans/_components/fan-context';

export function AllFans() {
	const {
		fans,
		fanSelection,
		lastSelectedFanId,
		setFanSelection,
		gridListRef,
		setShowUpdateFanModal,
	} = useFanContext();

	return (
		<div className='flex flex-col gap-4'>
			<GridList
				glRef={gridListRef}
				className='flex flex-col gap-2'
				aria-label='Fans'
				selectionMode='multiple'
				selectionBehavior='replace'
				onAction={() => {
					if (!lastSelectedFanId) return;
					setShowUpdateFanModal(true);
				}}
				items={fans}
				selectedKeys={fanSelection}
				setSelectedKeys={setFanSelection}
				renderEmptyState={() => (
					<NoResultsPlaceholder
						icon='fan'
						title='No Fans'
						subtitle='Create a new fan to get started.'
						button={<CreateFanButton />}
					/>
				)}
			>
				{fan => <FanCard fan={fan} />}
			</GridList>
			<LoadMoreButton />
		</div>
	);
}

function LoadMoreButton() {
	const { hasNextPage, fetchNextPage, isFetchingNextPage } = useFanContext();
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
	const { setShowUpdateFanModal, setShowDeleteFanModal } = useFanContext();

	return (
		<GridListCard
			id={fan.id}
			key={fan.id}
			textValue={fan.fullName}
			setShowUpdateModal={setShowUpdateFanModal}
			setShowDeleteModal={setShowDeleteFanModal}
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

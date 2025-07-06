'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { useWorkspace } from '@barely/hooks';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';
import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/grid-list';
import { Text } from '@barely/ui/typography';

import { CreateFanGroupButton } from '~/app/[handle]/fan-groups/_components/create-fan-group-button';
import {
	useFanGroup,
	useFanGroupSearchParams,
} from '~/app/[handle]/fan-groups/_components/fan-group-context';

export function AllFanGroups() {
	const { setShowUpdateModal } = useFanGroupSearchParams();
	const { items, selection, lastSelectedItemId, setSelection, isFetching } =
		useFanGroup();

	const trpc = useTRPC();
	const { handle } = useWorkspace();

	const { data: totalFans } = useSuspenseQuery(
		trpc.fan.totalByWorkspace.queryOptions({
			handle,
		}),
	);

	return (
		<>
			<Text variant='md/medium'>{totalFans} fans</Text>
			<GridList
				data-grid-list='fan-groups'
				className='flex flex-col gap-2'
				aria-label='Fan Groups'
				selectionMode='multiple'
				selectionBehavior='replace'
				onAction={async () => {
					if (!lastSelectedItemId) return;
					await setShowUpdateModal(true);
				}}
				items={items}
				selectedKeys={selection}
				setSelectedKeys={setSelection}
				renderEmptyState={() => (
					<>
						{isFetching ?
							<GridListSkeleton />
						:	<NoResultsPlaceholder
								icon='fanGroup'
								title='No Fan Groups'
								subtitle='Create a new fan group to get started.'
								button={<CreateFanGroupButton />}
							/>
						}
					</>
				)}
			>
				{fanGroup => <FanGroupCard fanGroup={fanGroup} />}
			</GridList>
		</>
	);
}

function FanGroupCard({
	fanGroup,
}: {
	fanGroup: AppRouterOutputs['fanGroup']['byWorkspace']['fanGroups'][0];
}) {
	const { setShowUpdateModal, setShowArchiveModal, setShowDeleteModal } =
		useFanGroupSearchParams();

	const trpc = useTRPC();
	const { handle } = useWorkspace();
	const { data: fanGroupById } = useSuspenseQuery(
		trpc.fanGroup.byId.queryOptions({
			id: fanGroup.id,
			handle,
		}),
	);

	return (
		<GridListCard
			id={fanGroup.id}
			key={fanGroup.id}
			textValue={fanGroup.name}
			setShowUpdateModal={setShowUpdateModal}
			setShowArchiveModal={setShowArchiveModal}
			setShowDeleteModal={setShowDeleteModal}
		>
			<div className='flex flex-grow flex-row items-center gap-4'>
				<div className='flex flex-col gap-1'>
					<Text variant='md/medium'>{fanGroup.name}</Text>
					<Text variant='sm/medium'>{fanGroupById?.count} fans</Text>
				</div>
			</div>
		</GridListCard>
	);
}

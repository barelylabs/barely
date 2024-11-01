'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/router';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';

import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/elements/grid-list';
import { Text } from '@barely/ui/elements/typography';

import { CreateFanGroupButton } from '~/app/[handle]/fan-groups/_components/create-fan-group-button';
import { useFanGroupContext } from '~/app/[handle]/fan-groups/_components/fan-group-context';

export function AllFanGroups() {
	const {
		fanGroups,
		gridListRef,
		fanGroupSelection,
		lastSelectedFanGroupId,
		setFanGroupSelection,
		setShowUpdateFanGroupModal,
	} = useFanGroupContext();

	const { handle } = useWorkspace();

	const { data: totalFans } = api.fan.totalByWorkspace.useQuery({
		handle,
	});

	return (
		<>
			<Text variant='md/medium'>{totalFans} fans</Text>
			<GridList
				glRef={gridListRef}
				className='flex flex-col gap-2'
				aria-label='Fan Groups'
				selectionMode='multiple'
				selectionBehavior='replace'
				onAction={() => {
					if (!lastSelectedFanGroupId) return;
					setShowUpdateFanGroupModal(true);
				}}
				items={fanGroups}
				selectedKeys={fanGroupSelection}
				setSelectedKeys={setFanGroupSelection}
				renderEmptyState={() => (
					<NoResultsPlaceholder
						icon='fanGroup'
						title='No Fan Groups'
						subtitle='Create a new fan group to get started.'
						button={<CreateFanGroupButton />}
					/>
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
	const {
		setShowUpdateFanGroupModal,
		setShowArchiveFanGroupModal,
		setShowDeleteFanGroupModal,
	} = useFanGroupContext();

	const { handle } = useWorkspace();
	const { data: fanGroupById } = api.fanGroup.byId.useQuery({
		id: fanGroup.id,
		handle,
	});

	return (
		<GridListCard
			id={fanGroup.id}
			key={fanGroup.id}
			textValue={fanGroup.name}
			setShowUpdateModal={setShowUpdateFanGroupModal}
			setShowArchiveModal={setShowArchiveFanGroupModal}
			setShowDeleteModal={setShowDeleteFanGroupModal}
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

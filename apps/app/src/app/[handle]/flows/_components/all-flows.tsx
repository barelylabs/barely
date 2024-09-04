'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/router';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';

import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { Button } from '@barely/ui/elements/button';
import { GridList, GridListCard } from '@barely/ui/elements/grid-list';
import { Text } from '@barely/ui/elements/typography';

import { CreateFlowButton } from '~/app/[handle]/flows/_components/create-flow-button';
import { useFlowContext } from '~/app/[handle]/flows/_components/flow-context';

export function AllFlows() {
	const { flows, flowSelection, setFlowSelection, lastSelectedFlowId } = useFlowContext();
	const router = useRouter();
	const { handle } = useWorkspace();
	return (
		<div className='flex flex-col gap-4'>
			<GridList
				aria-label='Flows'
				className='flex flex-col gap-4'
				selectionMode='multiple'
				selectionBehavior='replace'
				items={flows}
				selectedKeys={flowSelection}
				setSelectedKeys={setFlowSelection}
				onAction={() => {
					if (!lastSelectedFlowId) return;
					router.push(`/${handle}/flows/${lastSelectedFlowId}`);
				}}
				renderEmptyState={() => (
					<NoResultsPlaceholder
						icon='flow'
						title='No flows found.'
						button={<CreateFlowButton />}
					/>
				)}
			>
				{flow => <FlowCard flow={flow} />}
			</GridList>
			<LoadMoreButton />
		</div>
	);
}

function LoadMoreButton() {
	const { flows, hasNextPage, fetchNextPage, isFetchingNextPage } = useFlowContext();

	if (flows.length === 0) return null;

	if (!hasNextPage)
		return (
			<div className='flex w-full justify-center'>
				<Text variant='sm/normal'>No more flows to load.</Text>
			</div>
		);

	return (
		<Button
			look='primary'
			onClick={() => fetchNextPage()}
			loading={isFetchingNextPage}
			fullWidth
		>
			Load more flows
		</Button>
	);
}

function FlowCard({
	flow,
}: {
	flow: AppRouterOutputs['flow']['byWorkspace']['flows'][number];
}) {
	const {
		setShowArchiveFlowModal,
		setShowDeleteFlowModal,
		flowSelection,
		setFlowSelection,
	} = useFlowContext();

	const { handle } = useWorkspace();
	const router = useRouter();

	return (
		<GridListCard
			id={flow.id}
			key={flow.id}
			textValue={flow.name}
			setShowArchiveModal={setShowArchiveFlowModal}
			setShowDeleteModal={setShowDeleteFlowModal}
			commandItems={[
				{
					label: 'Open',
					icon: 'edit',
					action: () => router.push(`${handle}/flows/${flow.id}`),
					shortcut: ['Enter'],
				},
			]}
			actionOnCommandMenuOpen={() => {
				if (flowSelection === 'all' || flowSelection.has(flow.id)) {
					return;
				}
				setFlowSelection(new Set([flow.id]));
			}}
		>
			<div className='flex w-full flex-col gap-4'>
				<div className='flex flex-row items-center gap-2'>
					<Text variant='lg/bold'>{flow.name}</Text>
				</div>
			</div>
		</GridListCard>
	);
}

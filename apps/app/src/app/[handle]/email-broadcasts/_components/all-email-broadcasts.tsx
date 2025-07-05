'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { formatCentsToDollars, formatDate } from '@barely/utils';

import { Button } from '@barely/ui/button';
import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';
import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/grid-list';
import { Icon } from '@barely/ui/icon';
import { Text } from '@barely/ui/typography';

import { CreateEmailBroadcastButton } from './create-email-broadcast-button';
import { useEmailBroadcastsContext } from './email-broadcasts-context';

export function AllEmailBroadcasts() {
	const {
		items,
		selection,
		lastSelectedItemId,
		setSelection,
		gridListRef,
		setShowUpdateModal,
		isFetching,
	} = useEmailBroadcastsContext();

	return (
		<div className='flex flex-col gap-4'>
			<GridList
				glRef={gridListRef}
				className='flex flex-col gap-2'
				aria-label='Email Broadcasts'
				selectionMode='multiple'
				selectionBehavior='replace'
				onAction={() => {
					if (!lastSelectedItemId) return;
					setShowUpdateModal(true);
				}}
				items={items}
				selectedKeys={selection}
				setSelectedKeys={setSelection}
				renderEmptyState={() =>
					isFetching ?
						<GridListSkeleton />
					:	<NoResultsPlaceholder
							icon='broadcast'
							title='No Email Broadcasts'
							subtitle='Create a new email broadcast to get started.'
							button={<CreateEmailBroadcastButton />}
						/>
				}
			>
				{emailBroadcast => <EmailBroadcastCard emailBroadcast={emailBroadcast} />}
			</GridList>
			{!!items.length && <LoadMoreButton />}
		</div>
	);
}

function LoadMoreButton() {
	const { hasNextPage, fetchNextPage, isFetchingNextPage } = useEmailBroadcastsContext();
	if (!hasNextPage)
		return (
			<div className='flex w-full justify-center'>
				<Text variant='sm/normal'>No more email broadcasts to load.</Text>
			</div>
		);

	return (
		<Button
			look='primary'
			onClick={() => fetchNextPage()}
			loading={isFetchingNextPage}
			fullWidth
		>
			Load more broadcasts
		</Button>
	);
}

function EmailBroadcastCard({
	emailBroadcast,
}: {
	emailBroadcast: AppRouterOutputs['emailBroadcast']['byWorkspace']['emailBroadcasts'][number];
}) {
	const {
		id,
		status,
		sentAt,
		scheduledAt,
		emailTemplate,
		value,
		clicks,
		opens,
		deliveries,
	} = emailBroadcast;

	const { setShowUpdateModal } = useEmailBroadcastsContext();

	return (
		<GridListCard
			id={id}
			key={id}
			textValue={emailTemplate.name}
			setShowUpdateModal={setShowUpdateModal}
			title={emailTemplate.name}
			subtitle={emailTemplate.name}
			description={
				<div className='flex flex-row items-center gap-2'>
					{/* <Text variant='sm/normal'>{status}</Text> */}
					{status === 'sent' && sentAt && (
						<>
							<Icon.send className='h-2.5 w-2.5' />
							<Text variant='xs/normal' className='text-muted-foreground'>
								{formatDate(sentAt)}
							</Text>
						</>
					)}
					{status === 'scheduled' && scheduledAt && (
						<>
							<Icon.schedule className='h-3 w-3' />
							<Text variant='xs/normal' className='text-muted-foreground'>
								{formatDate(scheduledAt)}
							</Text>
						</>
					)}
				</div>
			}
			stats={[
				{
					icon: 'send',
					name: 'deliveries',
					value: deliveries,
				},
				{
					icon: 'view',
					name: 'opens',
					value: opens,
				},
				{
					icon: 'click',
					name: 'clicks',
					value: clicks,
				},
				{
					icon: 'value',
					name: 'value',
					value: formatCentsToDollars(value ?? 0),
				},
			]}
		/>
	);
}

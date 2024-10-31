'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/router';
import { formatDate } from '@barely/lib/utils/format-date';

// import { useWorkspace } from '@barely/lib/hooks/use-workspace';
// import { api } from '@barely/lib/server/api/react';

import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { Button } from '@barely/ui/elements/button';
import { GridList, GridListCard } from '@barely/ui/elements/grid-list';
import { Text } from '@barely/ui/elements/typography';

import { CreateEmailBroadcastButton } from './create-email-broadcast-button';
import { useEmailBroadcastsContext } from './email-broadcasts-context';

export function AllEmailBroadcasts() {
	const {
		emailBroadcasts,
		emailBroadcastSelection,
		lastSelectedEmailBroadcastId,
		setEmailBroadcastSelection,
		gridListRef,
		setShowUpdateEmailBroadcastModal,
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
					if (!lastSelectedEmailBroadcastId) return;
					setShowUpdateEmailBroadcastModal(true);
				}}
				items={emailBroadcasts}
				selectedKeys={emailBroadcastSelection}
				setSelectedKeys={setEmailBroadcastSelection}
				renderEmptyState={() => (
					<NoResultsPlaceholder
						icon='broadcast'
						title='No Email Broadcasts'
						subtitle='Create a new email broadcast to get started.'
						button={<CreateEmailBroadcastButton />}
					/>
				)}
			>
				{emailBroadcast => <EmailBroadcastCard emailBroadcast={emailBroadcast} />}
			</GridList>
			<LoadMoreButton />
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
	const { id, status, sentAt, scheduledAt, emailTemplate } = emailBroadcast;

	const { setShowUpdateEmailBroadcastModal } = useEmailBroadcastsContext();

	return (
		<GridListCard
			id={id}
			key={id}
			textValue={emailTemplate.name}
			setShowUpdateModal={setShowUpdateEmailBroadcastModal}
		>
			<div className='flex flex-grow flex-row items-center gap-4'>
				<div className='flex flex-col gap-1'>
					<Text variant='md/medium'>{emailTemplate.name}</Text>
					<div className='flex flex-row items-center gap-2'>
						<Text variant='sm/normal'>{status}</Text>
						{status === 'sent' && sentAt && (
							<Text variant='sm/normal'>@{formatDate(sentAt)}</Text>
						)}
						{status === 'scheduled' && scheduledAt && (
							<Text variant='sm/normal'>@{formatDate(scheduledAt)}</Text>
						)}
					</div>
				</div>
			</div>
		</GridListCard>
	);
}

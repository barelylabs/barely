'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/router';
import { useWorkspace } from '@barely/lib/hooks/use-workspace';
import { api } from '@barely/lib/server/api/react';

import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';
import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { Button } from '@barely/ui/elements/button';
import { GridList, GridListCard } from '@barely/ui/elements/grid-list';
import { Text } from '@barely/ui/elements/typography';

import { CreateEmailTemplateGroupButton } from './create-email-template-group-button';
import { useEmailTemplateGroupContext } from './email-template-group-context';

export function AllEmailTemplateGroups() {
	const {
		items,
		selection,
		lastSelectedItemId,
		setSelection,
		gridListRef,
		setShowUpdateModal,
		isFetching,
	} = useEmailTemplateGroupContext();

	return (
		<div className='flex flex-col gap-4'>
			<GridList
				glRef={gridListRef}
				className='flex flex-col gap-2'
				aria-label='Email Template Groups'
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
							icon='emailTemplateGroup'
							title='No Email Template Groups'
							subtitle='Create a new email template group to get started.'
							button={<CreateEmailTemplateGroupButton />}
						/>
				}
			>
				{item => <EmailTemplateGroupCard emailTemplateGroup={item} />}
			</GridList>
			{!!items.length && <LoadMoreButton />}
		</div>
	);
}

function LoadMoreButton() {
	const { hasNextPage, fetchNextPage, isFetchingNextPage } =
		useEmailTemplateGroupContext();
	if (!hasNextPage)
		return (
			<div className='flex w-full justify-center'>
				<Text variant='sm/normal'>No more email template groups to load.</Text>
			</div>
		);
	return (
		<Button
			look='primary'
			onClick={() => fetchNextPage()}
			loading={isFetchingNextPage}
			fullWidth
		>
			Load more email template groups
		</Button>
	);
}

function EmailTemplateGroupCard({
	emailTemplateGroup,
}: {
	emailTemplateGroup: AppRouterOutputs['emailTemplateGroup']['byWorkspace']['emailTemplateGroups'][0];
}) {
	const { setShowUpdateModal, setShowDeleteModal } = useEmailTemplateGroupContext();

	const { handle } = useWorkspace();

	// todo: this isn't ideal. maybe add a count to the query in the router instead of this
	const { data: emailTemplates } = api.emailTemplate.byEmailTemplateGroup.useQuery(
		{
			handle: handle,
			emailTemplateGroupId: emailTemplateGroup.id,
		},
		{
			select: data => data.emailTemplates,
		},
	);

	return (
		<GridListCard
			id={emailTemplateGroup.id}
			key={emailTemplateGroup.id}
			textValue={emailTemplateGroup.name}
			setShowUpdateModal={setShowUpdateModal}
			setShowDeleteModal={setShowDeleteModal}
		>
			<div className='flex flex-grow flex-row items-center gap-4'>
				<div className='flex flex-col gap-1'>
					<Text variant='md/medium'>{emailTemplateGroup.name}</Text>
					<Text variant='sm/normal'>{`${emailTemplates ? emailTemplates.length : 0} templates`}</Text>
				</div>
			</div>
		</GridListCard>
	);
}

'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { useWorkspace } from '@barely/hooks';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Button } from '@barely/ui/button';
import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';
import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/grid-list';
import { Text } from '@barely/ui/typography';

import { CreateEmailTemplateGroupButton } from './create-email-template-group-button';
import {
	useEmailTemplateGroup,
	useEmailTemplateGroupSearchParams,
} from './email-template-group-context';

export function AllEmailTemplateGroups() {
	const { setShowUpdateModal } = useEmailTemplateGroupSearchParams();
	const { items, selection, lastSelectedItemId, setSelection, isFetching } =
		useEmailTemplateGroup();

	return (
		<div className='flex flex-col gap-4'>
			<GridList
				data-grid-list='email-template-groups'
				className='flex flex-col gap-2'
				aria-label='Email Template Groups'
				selectionMode='multiple'
				selectionBehavior='replace'
				onAction={async () => {
					if (!lastSelectedItemId) return;
					await setShowUpdateModal(true);
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
	const { hasNextPage, fetchNextPage, isFetchingNextPage } = useEmailTemplateGroup();
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
	const { setShowUpdateModal, setShowDeleteModal } = useEmailTemplateGroupSearchParams();

	const trpc = useTRPC();
	const { handle } = useWorkspace();

	// todo: this isn't ideal. maybe add a count to the query in the router instead of this
	const { data: emailTemplates } = useSuspenseQuery(
		trpc.emailTemplate.byEmailTemplateGroup.queryOptions(
			{
				handle: handle,
				emailTemplateGroupId: emailTemplateGroup.id,
			},
			{
				select: data => data.emailTemplates,
			},
		),
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
					<Text variant='sm/normal'>{`${emailTemplates.length} templates`}</Text>
				</div>
			</div>
		</GridListCard>
	);
}

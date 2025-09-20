'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { useWorkspace } from '@barely/hooks';
import { formatMinorToMajorCurrency } from '@barely/utils';

import { Button } from '@barely/ui/button';
import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';
import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/grid-list';
import { Text } from '@barely/ui/typography';

import { CreateEmailTemplateButton } from './create-email-template-button';
import { useEmailTemplate, useEmailTemplateSearchParams } from './email-template-context';

export function AllEmailTemplates() {
	const { setShowUpdateModal } = useEmailTemplateSearchParams();
	const { items, selection, lastSelectedItemId, setSelection, isFetching } =
		useEmailTemplate();

	return (
		<div className='flex flex-col gap-4'>
			<GridList
				data-grid-list='email-templates'
				className='flex flex-col gap-2'
				aria-label='Email Templates'
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
							icon='email'
							title='No Email Templates'
							subtitle='Create a new email template to get started.'
							button={<CreateEmailTemplateButton />}
						/>
				}
			>
				{emailTemplate => <EmailTemplateCard emailTemplate={emailTemplate} />}
			</GridList>
			{!!items.length && <LoadMoreButton />}
		</div>
	);
}

function LoadMoreButton() {
	const { hasNextPage, fetchNextPage, isFetchingNextPage } = useEmailTemplate();
	if (!hasNextPage)
		return (
			<div className='flex w-full justify-center'>
				<Text variant='sm/normal'>No more email templates to load.</Text>
			</div>
		);
	return (
		<Button
			look='primary'
			onClick={() => fetchNextPage()}
			loading={isFetchingNextPage}
			fullWidth
		>
			Load more email templates
		</Button>
	);
}

function EmailTemplateCard({
	emailTemplate,
}: {
	emailTemplate: AppRouterOutputs['emailTemplate']['byWorkspace']['emailTemplates'][0];
}) {
	const { workspace } = useWorkspace();
	const { setShowUpdateModal, setShowDeleteModal } = useEmailTemplateSearchParams();

	const { name, subject, opens, clicks, value } = emailTemplate;

	return (
		<GridListCard
			id={emailTemplate.id}
			key={emailTemplate.id}
			textValue={emailTemplate.name}
			setShowUpdateModal={setShowUpdateModal}
			setShowDeleteModal={setShowDeleteModal}
			title={name}
			subtitle={subject}
			stats={[
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
					value: formatMinorToMajorCurrency(value ?? 0, workspace.currency),
				},
			]}
		/>
	);
}

'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/router';
import { formatCentsToDollars } from '@barely/lib/utils/currency';

import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { Button } from '@barely/ui/elements/button';
import { GridList, GridListCard } from '@barely/ui/elements/grid-list';
import { Text } from '@barely/ui/elements/typography';

import { CreateEmailTemplateButton } from './create-email-template-button';
import { useEmailTemplateContext } from './email-template-context';

export function AllEmailTemplates() {
	const {
		emailTemplates,
		emailTemplateSelection,
		lastSelectedEmailTemplateId,
		setEmailTemplateSelection,
		gridListRef,
		setShowUpdateEmailTemplateModal,
	} = useEmailTemplateContext();

	return (
		<div className='flex flex-col gap-4'>
			<GridList
				glRef={gridListRef}
				className='flex flex-col gap-2'
				aria-label='Email Templates'
				selectionMode='multiple'
				selectionBehavior='replace'
				onAction={() => {
					if (!lastSelectedEmailTemplateId) return;
					setShowUpdateEmailTemplateModal(true);
				}}
				items={emailTemplates}
				selectedKeys={emailTemplateSelection}
				setSelectedKeys={setEmailTemplateSelection}
				renderEmptyState={() => (
					<NoResultsPlaceholder
						icon='email'
						title='No Email Templates'
						subtitle='Create a new email template to get started.'
						button={<CreateEmailTemplateButton />}
					/>
				)}
			>
				{emailTemplate => <EmailTemplateCard emailTemplate={emailTemplate} />}
			</GridList>
			<LoadMoreButton />
		</div>
	);
}

function LoadMoreButton() {
	const { hasNextPage, fetchNextPage, isFetchingNextPage } = useEmailTemplateContext();
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
	const { setShowUpdateEmailTemplateModal, setShowDeleteEmailTemplateModal } =
		useEmailTemplateContext();

	const { name, subject, opens, clicks, value } = emailTemplate;

	return (
		<GridListCard
			id={emailTemplate.id}
			key={emailTemplate.id}
			textValue={emailTemplate.name}
			setShowUpdateModal={setShowUpdateEmailTemplateModal}
			setShowDeleteModal={setShowDeleteEmailTemplateModal}
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
					value: formatCentsToDollars(value ?? 0),
				},
			]}
		/>
	);
}

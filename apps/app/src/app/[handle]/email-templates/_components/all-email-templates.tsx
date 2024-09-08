'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/router';

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

	return (
		<GridListCard
			id={emailTemplate.id}
			key={emailTemplate.id}
			textValue={emailTemplate.name}
			setShowUpdateModal={setShowUpdateEmailTemplateModal}
			setShowDeleteModal={setShowDeleteEmailTemplateModal}
		>
			<div className='flex flex-grow flex-row items-center gap-4'>
				<div className='flex flex-col gap-1'>
					<Text variant='md/medium'>{emailTemplate.name}</Text>
					<Text variant='sm/normal'>{emailTemplate.subject}</Text>
				</div>
			</div>
		</GridListCard>
	);
}

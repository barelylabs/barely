'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';

import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/grid-list';
import { Icon } from '@barely/ui/icon';
import { Text } from '@barely/ui/typography';

import { CreateEmailAddressButton } from './create-email-address-button';
import { useEmailAddress, useEmailAddressSearchParams } from './email-address-context';

export function AllEmailAddresses() {
	const {
		items: emailAddresses,
		selection: emailAddressSelection,
		lastSelectedItemId: lastSelectedEmailAddressId,
		setSelection: setEmailAddressSelection,
	} = useEmailAddress();

	const { setShowUpdateModal } = useEmailAddressSearchParams();

	return (
		<GridList
			data-grid-list='email-addresses'
			className='flex flex-col gap-2'
			aria-label='Email addresses'
			selectionMode='multiple'
			selectionBehavior='replace'
			onAction={() => {
				if (!lastSelectedEmailAddressId) return;
				void setShowUpdateModal(true);
			}}
			items={emailAddresses}
			selectedKeys={emailAddressSelection}
			setSelectedKeys={setEmailAddressSelection}
			renderEmptyState={() => (
				<NoResultsPlaceholder
					icon='email'
					title='No email addresses'
					subtitle='Add an email address to get started'
					button={<CreateEmailAddressButton />}
				/>
			)}
		>
			{emailAddress => <EmailAddressCard emailAddress={emailAddress} />}
		</GridList>
	);
}

function EmailAddressCard({
	emailAddress,
}: {
	emailAddress: AppRouterOutputs['emailAddress']['byWorkspace']['emailAddresses'][number];
}) {
	const { setShowUpdateModal } = useEmailAddressSearchParams();

	const status = emailAddress.domain.status;

	return (
		<GridListCard
			id={emailAddress.id}
			key={emailAddress.id}
			textValue={emailAddress.email}
			setShowUpdateModal={setShowUpdateModal}
		>
			<div className='flex flex-grow flex-row items-center gap-2'>
				<Text variant='md/medium'>{emailAddress.email}</Text>
				{/* <Text variant='sm/normal'>Status: {emailAddress.domain.status}</Text> */}
				{status === 'verified' ?
					<Icon.checkCircleFilled className='h-4 w-4 text-muted-foreground' />
				: status === 'failed' ?
					<Icon.xCircle className='text-error-500 h-4 w-4' />
				:	<Icon.alert className='text-warning-500 h-4 w-4' />}
			</div>
		</GridListCard>
	);
}

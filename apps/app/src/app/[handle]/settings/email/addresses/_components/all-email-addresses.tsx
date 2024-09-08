'use client';

import type { AppRouterOutputs } from '@barely/lib/server/api/router';

import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/elements/grid-list';
import { Icon } from '@barely/ui/elements/icon';
import { Text } from '@barely/ui/elements/typography';

import { CreateEmailAddressButton } from './create-email-address-button';
import { useEmailAddressContext } from './email-address-context';

export function AllEmailAddresses() {
	const {
		emailAddresses,
		emailAddressSelection,
		lastSelectedEmailAddressId,
		setEmailAddressSelection,
		gridListRef,
		setShowUpdateEmailAddressModal,
	} = useEmailAddressContext();

	return (
		<GridList
			glRef={gridListRef}
			className='flex flex-col gap-2'
			aria-label='Email addresses'
			selectionMode='multiple'
			selectionBehavior='replace'
			onAction={() => {
				if (!lastSelectedEmailAddressId) return;
				setShowUpdateEmailAddressModal(true);
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
	const { setShowUpdateEmailAddressModal } = useEmailAddressContext();

	const status = emailAddress.domain.status;

	return (
		<GridListCard
			id={emailAddress.id}
			key={emailAddress.id}
			textValue={emailAddress.email}
			setShowUpdateModal={setShowUpdateEmailAddressModal}
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

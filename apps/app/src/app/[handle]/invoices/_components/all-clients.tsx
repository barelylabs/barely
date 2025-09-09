'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';

import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';
import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/grid-list';

import {
	useClient,
	useClientSearchParams,
} from '~/app/[handle]/invoices/_components/client-context';
import { CreateClientButton } from '~/app/[handle]/invoices/_components/create-client-button';

export function AllClients() {
	const { setShowUpdateModal } = useClientSearchParams();
	const { items, selection, lastSelectedItemId, setSelection, gridListRef, isFetching } =
		useClient();

	return (
		<>
			<GridList
				glRef={gridListRef}
				className='flex flex-col gap-2'
				aria-label='Clients'
				data-grid-list='clients'
				selectionMode='multiple'
				selectionBehavior='replace'
				onAction={async () => {
					if (!lastSelectedItemId) return;
					await setShowUpdateModal(true);
				}}
				items={items}
				selectedKeys={selection}
				setSelectedKeys={setSelection}
				renderEmptyState={() => (
					<>
						{isFetching ?
							<GridListSkeleton />
						:	<NoResultsPlaceholder
								icon='users'
								title='No clients found.'
								subtitle='Add your first client to start creating invoices.'
								button={<CreateClientButton />}
							/>
						}
					</>
				)}
			>
				{item => <ClientCard client={item} />}
			</GridList>
		</>
	);
}

function ClientCard({
	client,
}: {
	client: AppRouterOutputs['invoiceClient']['byWorkspace']['clients'][0];
}) {
	const { setShowUpdateModal, setShowDeleteModal } = useClientSearchParams();

	return (
		<GridListCard
			id={client.id}
			key={client.id}
			textValue={client.name}
			setShowUpdateModal={setShowUpdateModal}
			setShowDeleteModal={setShowDeleteModal}
			title={client.name}
			subtitle={client.company ?? client.email}
			stats={[
				{
					icon: 'receipt',
					name: 'Invoices',
					value: 0, // TODO: Add invoice count when available from API
				},
			]}
		/>
	);
}

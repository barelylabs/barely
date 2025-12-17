'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { useParams, useRouter } from 'next/navigation';
import { useWorkspaceCurrency } from '@barely/hooks';
import { formatMinorToMajorCurrency, getAbsoluteUrl } from '@barely/utils';
import { format } from 'date-fns';

import { Badge } from '@barely/ui/badge';
import { GridListSkeleton } from '@barely/ui/components/grid-list-skeleton';
import { NoResultsPlaceholder } from '@barely/ui/components/no-results-placeholder';
import { GridList, GridListCard } from '@barely/ui/grid-list';

import { CreateInvoiceButton } from '~/app/[handle]/invoices/_components/create-invoice-button';
import { useInvoice } from '~/app/[handle]/invoices/_components/invoice-context';

export function AllInvoices() {
	const params = useParams();
	const handle = params.handle as string;
	const router = useRouter();
	const { items, selection, lastSelectedItemId, setSelection, gridListRef, isFetching } =
		useInvoice();

	return (
		<>
			<GridList
				glRef={gridListRef}
				className='flex flex-col gap-2'
				aria-label='Invoices'
				data-grid-list='invoices'
				selectionMode='multiple'
				selectionBehavior='replace'
				onAction={() => {
					if (!lastSelectedItemId) return;
					router.push(`/${handle}/invoices/${lastSelectedItemId}`);
				}}
				items={items}
				selectedKeys={selection}
				setSelectedKeys={setSelection}
				renderEmptyState={() => (
					<>
						{isFetching ?
							<GridListSkeleton />
						:	<NoResultsPlaceholder
								icon='receipt'
								title='No invoices found.'
								subtitle='Create your first invoice to get started.'
								button={<CreateInvoiceButton />}
							/>
						}
					</>
				)}
			>
				{item => <InvoiceCard invoice={item} handle={handle} />}
			</GridList>
		</>
	);
}

function InvoiceCard({
	invoice,
	handle,
}: {
	invoice: AppRouterOutputs['invoice']['byWorkspace']['invoices'][0];
	handle: string;
}) {
	const { setShowArchiveModal, setShowDeleteModal } = useInvoice();
	const currency = useWorkspaceCurrency();
	const router = useRouter();
	const getStatusColor = (status: string) => {
		switch (status) {
			case 'draft':
				return 'secondary';
			case 'sent':
				return 'info';
			case 'viewed':
				return 'warning';
			case 'paid':
				return 'success';
			case 'overdue':
				return 'danger';
			case 'voided':
				return 'outline';
			default:
				return 'secondary';
		}
	};

	// const href = `/${handle}/invoices/${invoice.id}`;
	const href = getAbsoluteUrl('invoice', `pay/${handle}/${invoice.id}`);

	const subtitleText = `${invoice.client.name} • ${format(new Date(invoice.dueDate), 'MMM dd')}`;

	return (
		<GridListCard
			id={invoice.id}
			key={invoice.id}
			textValue={invoice.invoiceNumber}
			setShowUpdateModal={() => router.push(`/${handle}/invoices/${invoice.id}`)}
			setShowArchiveModal={setShowArchiveModal}
			setShowDeleteModal={setShowDeleteModal}
			title={invoice.invoiceNumber}
			subtitle={subtitleText}
			quickActions={{
				goToHref: href,
				copyText: href,
			}}
			stats={[
				{
					icon: 'value',
					name: 'Amount',
					value: formatMinorToMajorCurrency(invoice.total, currency),
				},
			]}
			statsHref={href}
			statusBadge={
				<Badge variant={getStatusColor(invoice.status)}>{invoice.status}</Badge>
			}
		/>
	);
}

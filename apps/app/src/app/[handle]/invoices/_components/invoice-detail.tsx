'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import { useRouter } from 'next/navigation';
import { formatCentsToDollars, getAbsoluteUrl } from '@barely/utils';
import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { useTRPC } from '@barely/api/app/trpc.react';

import { Badge } from '@barely/ui/badge';
import { Button } from '@barely/ui/button';
import { Card } from '@barely/ui/card';
import { Icon } from '@barely/ui/icon';
import { Separator } from '@barely/ui/separator';
import { Text } from '@barely/ui/typography';

type Invoice = AppRouterOutputs['invoice']['byId'];

interface InvoiceDetailProps {
	invoice: Invoice;
	handle: string;
}

export function InvoiceDetail({ invoice, handle }: InvoiceDetailProps) {
	const router = useRouter();
	const trpc = useTRPC();
	const utils = trpc.useUtils();

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'draft':
				return 'secondary';
			case 'sent':
				return 'blue';
			case 'viewed':
				return 'yellow';
			case 'paid':
				return 'green';
			case 'overdue':
				return 'red';
			case 'voided':
				return 'outline';
			default:
				return 'secondary';
		}
	};

	// Mutations
	const { mutate: sendInvoice, isPending: isSending } = useMutation({
		...trpc.invoice.send.mutationOptions(),
		onSuccess: () => {
			toast.success('Invoice sent successfully');
			utils.invoice.byId.invalidate({ id: invoice.id });
			router.refresh();
		},
		onError: error => {
			toast.error(error.message || 'Failed to send invoice');
		},
	});

	const { mutate: markPaid, isPending: isMarkingPaid } = useMutation({
		...trpc.invoice.markPaid.mutationOptions(),
		onSuccess: () => {
			toast.success('Invoice marked as paid');
			utils.invoice.byId.invalidate({ id: invoice.id });
			router.refresh();
		},
		onError: error => {
			toast.error(error.message || 'Failed to mark invoice as paid');
		},
	});

	const { mutate: duplicateInvoice, isPending: isDuplicating } = useMutation({
		...trpc.invoice.duplicate.mutationOptions(),
		onSuccess: data => {
			toast.success('Invoice duplicated successfully');
			router.push(`/${handle}/invoices/${data.id}`);
		},
		onError: error => {
			toast.error(error.message || 'Failed to duplicate invoice');
		},
	});

	const { mutate: deleteInvoice, isPending: isDeleting } = useMutation({
		...trpc.invoice.delete.mutationOptions(),
		onSuccess: () => {
			toast.success('Invoice deleted successfully');
			router.push(`/${handle}/invoices`);
		},
		onError: error => {
			toast.error(error.message || 'Failed to delete invoice');
		},
	});

	// Get payment URL for this invoice
	const getPaymentUrl = () => {
		const baseUrl = getAbsoluteUrl('invoice');
		return `${baseUrl}/pay/${handle}/${invoice.id}`;
	};

	const copyPaymentLink = () => {
		navigator.clipboard.writeText(getPaymentUrl());
		toast.success('Payment link copied to clipboard');
	};

	return (
		<div className='space-y-6'>
			{/* Actions Bar */}
			<Card>
				<div className='flex flex-wrap items-center justify-between gap-4 px-6 py-4'>
					<Badge variant={getStatusColor(invoice.status)} className='text-sm'>
						{invoice.status.toUpperCase()}
					</Badge>

					<div className='flex flex-wrap gap-2'>
						{invoice.status === 'draft' && (
							<>
								<Button
									size='sm'
									onClick={() => sendInvoice({ handle, id: invoice.id })}
									disabled={isSending}
								>
									<Icon.send className='mr-2 h-4 w-4' />
									Send Invoice
								</Button>
								<Button
									size='sm'
									look='outline'
									onClick={() => router.push(`/${handle}/invoices/${invoice.id}/edit`)}
								>
									<Icon.edit className='mr-2 h-4 w-4' />
									Edit
								</Button>
							</>
						)}

						{(invoice.status === 'sent' || invoice.status === 'viewed') && (
							<Button
								size='sm'
								look='outline'
								onClick={() =>
									markPaid({ handle, id: invoice.id, paidAt: new Date().toISOString() })
								}
								disabled={isMarkingPaid}
							>
								<Icon.check className='mr-2 h-4 w-4' />
								Mark as Paid
							</Button>
						)}

						<Button size='sm' look='outline' onClick={copyPaymentLink}>
							<Icon.link className='mr-2 h-4 w-4' />
							Copy Payment Link
						</Button>

						<Button
							size='sm'
							look='outline'
							onClick={() => duplicateInvoice({ handle, id: invoice.id })}
							disabled={isDuplicating}
						>
							<Icon.copy className='mr-2 h-4 w-4' />
							Duplicate
						</Button>

						{invoice.status === 'draft' && (
							<Button
								size='sm'
								look='destructive'
								onClick={() => deleteInvoice({ ids: [invoice.id] })}
								disabled={isDeleting}
							>
								<Icon.trash className='mr-2 h-4 w-4' />
								Delete
							</Button>
						)}
					</div>
				</div>
			</Card>

			{/* Invoice Content */}
			<div className='grid gap-6 lg:grid-cols-3'>
				{/* Main Invoice Details */}
				<div className='space-y-6 lg:col-span-2'>
					{/* Invoice Header */}
					<Card>
						<div className='p-6 pb-3'>
							<h3 className='text-lg font-semibold'>Invoice Details</h3>
						</div>
						<div className='space-y-4 px-6 pb-6'>
							<div className='grid gap-4 sm:grid-cols-2'>
								<div>
									<Text variant='sm/normal' muted>
										Invoice Number
									</Text>
									<Text variant='base/medium'>{invoice.invoiceNumber}</Text>
								</div>
								<div>
									<Text variant='sm/normal' muted>
										Issue Date
									</Text>
									<Text variant='base/medium'>
										{format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
									</Text>
								</div>
								<div>
									<Text variant='sm/normal' muted>
										Due Date
									</Text>
									<Text variant='base/medium'>
										{invoice.dueDate ?
											format(new Date(invoice.dueDate), 'MMM dd, yyyy')
										:	'No due date'}
									</Text>
								</div>
								{invoice.paidAt && (
									<div>
										<Text variant='sm/normal' muted>
											Paid Date
										</Text>
										<Text variant='base/medium'>
											{format(new Date(invoice.paidAt), 'MMM dd, yyyy')}
										</Text>
									</div>
								)}
							</div>
						</div>
					</Card>

					{/* Client Information */}
					<Card>
						<div className='p-6 pb-3'>
							<h3 className='text-lg font-semibold'>Client Information</h3>
						</div>
						<div className='px-6 pb-6'>
							{invoice.client ?
								<div className='space-y-2'>
									<Text variant='base/medium'>{invoice.client.name}</Text>
									{invoice.client.company && (
										<Text variant='sm/normal' muted>
											{invoice.client.company}
										</Text>
									)}
									<Text variant='sm/normal' muted>
										{invoice.client.email}
									</Text>
									{invoice.client.address && (
										<Text variant='sm/normal' muted className='whitespace-pre-line'>
											{invoice.client.address}
										</Text>
									)}
								</div>
							:	<Text variant='sm/normal' muted>
									No client information
								</Text>
							}
						</div>
					</Card>

					{/* Line Items */}
					<Card>
						<div className='p-6 pb-3'>
							<h3 className='text-lg font-semibold'>Line Items</h3>
						</div>
						<div className='px-6 pb-6'>
							<div className='space-y-4'>
								{invoice.lineItems?.map((item, index) => (
									<div key={index}>
										{index > 0 && <Separator className='my-4' />}
										<div className='flex justify-between'>
											<div className='flex-1'>
												<Text variant='base/medium'>{item.description}</Text>
												<Text variant='sm/normal' muted>
													{item.quantity} × {formatCentsToDollars(item.unitPrice)}
												</Text>
											</div>
											<Text variant='base/medium'>
												{formatCentsToDollars(item.amount)}
											</Text>
										</div>
									</div>
								))}
							</div>
						</div>
					</Card>
				</div>

				{/* Invoice Summary */}
				<div className='lg:col-span-1'>
					<Card className='sticky top-4'>
						<div className='p-6 pb-3'>
							<h3 className='text-lg font-semibold'>Invoice Summary</h3>
						</div>
						<div className='px-6 pb-6'>
							<div className='space-y-2'>
								<div className='flex justify-between'>
									<Text variant='sm/normal' muted>
										Subtotal
									</Text>
									<Text variant='sm/normal'>
										{formatCentsToDollars(invoice.subtotal)}
									</Text>
								</div>
								{invoice.tax > 0 && (
									<div className='flex justify-between'>
										<Text variant='sm/normal' muted>
											Tax ({(invoice.tax / 100).toFixed(2)}%)
										</Text>
										<Text variant='sm/normal'>
											{formatCentsToDollars(
												Math.round((invoice.subtotal * invoice.tax) / 10000),
											)}
										</Text>
									</div>
								)}
								<Separator />
								<div className='flex justify-between'>
									<Text variant='base/semibold'>Total</Text>
									<Text variant='base/semibold'>
										{formatCentsToDollars(invoice.total)}
									</Text>
								</div>

								{invoice.status === 'paid' && invoice.paidAmount && (
									<>
										<Separator />
										<div className='flex justify-between text-green-600'>
											<Text variant='sm/normal'>Paid</Text>
											<Text variant='sm/normal'>
												{formatCentsToDollars(invoice.paidAmount)}
											</Text>
										</div>
									</>
								)}
							</div>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
}

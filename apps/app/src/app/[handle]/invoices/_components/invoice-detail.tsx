'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { BadgeProps } from '@barely/ui/badge';
import { useRouter } from 'next/navigation';
import { useCopy, useWorkspace } from '@barely/hooks';
import { formatMinorToMajorCurrency, getAbsoluteUrl } from '@barely/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
	const queryClient = useQueryClient();
	const { copyToClipboard } = useCopy();
	const { currency } = useWorkspace();

	const getStatusColor = (
		status: Invoice['status'] | 'overdue',
	): BadgeProps['variant'] => {
		switch (status) {
			case 'created':
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

	// Mutations
	const { mutate: sendInvoice, isPending: isSending } = useMutation(
		trpc.invoice.send.mutationOptions({
			onSuccess: () => {
				toast.success('Invoice sent successfully');
			},
			onError: error => {
				toast.error(error.message || 'Failed to send invoice');
			},
			onSettled: async () => {
				await queryClient.invalidateQueries({
					queryKey: trpc.invoice.byId.queryKey(),
				});
			},
		}),
	);

	const { mutate: markPaid, isPending: isMarkingPaid } = useMutation(
		trpc.invoice.markPaid.mutationOptions({
			onSuccess: () => {
				toast.success('Invoice marked as paid');
			},
			onError: error => {
				toast.error(error.message || 'Failed to mark invoice as paid');
			},
			onSettled: async () => {
				await queryClient.invalidateQueries({
					queryKey: trpc.invoice.byId.queryKey(),
				});
			},
		}),
	);

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
		copyToClipboard(getPaymentUrl(), {
			successMessage: 'Payment link copied to clipboard',
		});
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
						<Button
							size='sm'
							look='outline'
							onClick={async () => {
								const response = await fetch('/api/invoice/pdf', {
									method: 'POST',
									headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify({ handle, invoiceId: invoice.id }),
								});
								const data = (await response.json()) as {
									pdf?: string;
									filename?: string;
									error?: string;
								};
								if (data.pdf) {
									const blob = new Blob([Buffer.from(data.pdf, 'base64')], {
										type: 'application/pdf',
									});
									const url = window.URL.createObjectURL(blob);
									const link = document.createElement('a');
									link.href = url;
									link.download = data.filename ?? `invoice-${invoice.invoiceNumber}.pdf`;
									document.body.appendChild(link);
									link.click();
									document.body.removeChild(link);
									window.URL.revokeObjectURL(url);
								}
							}}
							startIcon='download'
						>
							Download PDF
						</Button>

						<Button
							size='sm'
							onClick={() => sendInvoice({ handle, id: invoice.id })}
							disabled={isSending}
							startIcon='send'
						>
							Send Invoice
						</Button>

						{(invoice.status === 'sent' || invoice.status === 'viewed') && (
							<Button
								size='sm'
								look='outline'
								onClick={() => markPaid({ handle, id: invoice.id, paidAt: new Date() })}
								disabled={isMarkingPaid}
								startIcon='check'
							>
								Mark as Paid
							</Button>
						)}

						<Button size='sm' look='outline' onClick={copyPaymentLink} startIcon='link'>
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

						{invoice.status !== 'paid' && invoice.status !== 'voided' && (
							<Button
								size='sm'
								look='destructive'
								onClick={() => deleteInvoice({ handle, ids: [invoice.id] })}
								disabled={isDeleting}
							>
								<Icon.trash className='mr-2 h-4 w-4' />
								Delete
							</Button>
						)}
					</div>
				</div>
			</Card>

			<pre>{JSON.stringify(invoice, null, 2)}</pre>
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
									<Text variant='md/medium'>{invoice.invoiceNumber}</Text>
								</div>
								<div>
									<Text variant='sm/normal' muted>
										Issue Date
									</Text>
									<Text variant='md/medium'>
										{format(new Date(invoice.createdAt), 'MMM dd, yyyy')}
									</Text>
								</div>
								<div>
									<Text variant='sm/normal' muted>
										Due Date
									</Text>
									<Text variant='md/medium'>
										format(new Date(invoice.dueDate), 'MMM dd, yyyy')
									</Text>
								</div>
								{invoice.paidAt && (
									<div>
										<Text variant='sm/normal' muted>
											Paid Date
										</Text>
										<Text variant='md/medium'>
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
							<div className='space-y-2'>
								<Text variant='md/medium'>{invoice.client.name}</Text>
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
						</div>
					</Card>

					{/* Line Items */}
					<Card>
						<div className='p-6 pb-3'>
							<h3 className='text-lg font-semibold'>Line Items</h3>
						</div>
						<div className='px-6 pb-6'>
							<div className='space-y-4'>
								{invoice.lineItems.map((item, index) => (
									<div key={index}>
										{index > 0 && <Separator className='my-4' />}
										<div className='flex justify-between'>
											<div className='flex-1'>
												<Text variant='md/medium'>{item.description}</Text>
												<Text variant='sm/normal' muted>
													{item.quantity} ×{' '}
													{formatMinorToMajorCurrency(item.rate, currency)}
												</Text>
											</div>
											<Text variant='md/medium'>
												{formatMinorToMajorCurrency(item.amount, currency)}
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
										{formatMinorToMajorCurrency(invoice.subtotal, currency)}
									</Text>
								</div>
								{invoice.tax > 0 && (
									<div className='flex justify-between'>
										<Text variant='sm/normal' muted>
											Tax ({(invoice.tax / 100).toFixed(2)}%)
										</Text>
										<Text variant='sm/normal'>
											{formatMinorToMajorCurrency(
												Math.round((invoice.subtotal * invoice.tax) / 10000),
												currency,
											)}
										</Text>
									</div>
								)}
								<Separator />
								<div className='flex justify-between'>
									<Text variant='md/semibold'>Total</Text>
									<Text variant='md/semibold'>
										{formatMinorToMajorCurrency(invoice.total, currency)}
									</Text>
								</div>

								{invoice.status === 'paid' && (
									<>
										<Separator />
										<div className='flex justify-between text-green-600'>
											<Text variant='sm/normal'>Paid</Text>
											<Text variant='sm/normal'>
												{formatMinorToMajorCurrency(invoice.total, currency)}
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

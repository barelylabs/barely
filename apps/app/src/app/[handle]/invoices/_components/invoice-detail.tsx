'use client';

import type { AppRouterOutputs } from '@barely/api/app/app.router';
import type { BadgeProps } from '@barely/ui/badge';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCopy, useWorkspaceWithAll } from '@barely/hooks';
import { formatMinorToMajorCurrency, getAbsoluteUrl } from '@barely/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { useTRPC } from '@barely/api/app/trpc.react';

import {
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogRoot,
	AlertDialogTitle,
} from '@barely/ui/alert-dialog';
import { Badge } from '@barely/ui/badge';
import { Button } from '@barely/ui/button';
import { Card } from '@barely/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@barely/ui/dropdown-menu';
import { Icon } from '@barely/ui/icon';
import { InvoiceRender } from '@barely/ui/invoice';
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
	const workspace = useWorkspaceWithAll();
	const { currency } = workspace;
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const isDraft = invoice.status === 'created';
	const isOverdue =
		(invoice.status === 'sent' || invoice.status === 'viewed') &&
		new Date(invoice.dueDate) < new Date();
	const displayStatus = isOverdue ? 'overdue' : invoice.status;

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

	const getStatusLabel = (status: Invoice['status']) => {
		if (status === 'created') return 'Draft';
		return status.charAt(0).toUpperCase() + status.slice(1);
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
				await Promise.all([
					queryClient.invalidateQueries({
						queryKey: trpc.invoice.byId.queryKey(),
					}),
					queryClient.invalidateQueries({
						queryKey: trpc.invoice.byWorkspace.queryKey(),
					}),
					queryClient.invalidateQueries({
						queryKey: trpc.invoice.stats.queryKey(),
					}),
				]);
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
				await Promise.all([
					queryClient.invalidateQueries({
						queryKey: trpc.invoice.byId.queryKey(),
					}),
					queryClient.invalidateQueries({
						queryKey: trpc.invoice.byWorkspace.queryKey(),
					}),
					queryClient.invalidateQueries({
						queryKey: trpc.invoice.stats.queryKey(),
					}),
				]);
			},
		}),
	);

	const { mutate: duplicateInvoice, isPending: isDuplicating } = useMutation(
		trpc.invoice.duplicate.mutationOptions({
			onSuccess: data => {
				toast.success('Invoice duplicated successfully');
				router.push(`/${handle}/invoices/${data.id}`);
			},
			onError: error => {
				toast.error(error.message || 'Failed to duplicate invoice');
			},
		}),
	);

	const { mutate: deleteInvoice, isPending: isDeleting } = useMutation(
		trpc.invoice.delete.mutationOptions({
			onSuccess: () => {
				toast.success('Invoice deleted successfully');
				router.push(`/${handle}/invoices`);
			},
			onError: error => {
				toast.error(error.message || 'Failed to delete invoice');
			},
			onSettled: async () => {
				await Promise.all([
					queryClient.invalidateQueries({
						queryKey: trpc.invoice.byWorkspace.queryKey(),
					}),
					queryClient.invalidateQueries({
						queryKey: trpc.invoice.stats.queryKey(),
					}),
				]);
			},
		}),
	);

	const getPaymentUrl = () => {
		const baseUrl = getAbsoluteUrl('invoice');
		return `${baseUrl}/pay/${handle}/${invoice.id}`;
	};

	const copyPaymentLink = () => {
		copyToClipboard(getPaymentUrl(), {
			successMessage: 'Payment link copied to clipboard',
		});
	};

	const { mutate: downloadPdf, isPending: isDownloading } = useMutation(
		trpc.invoice.downloadPdf.mutationOptions({
			onSuccess: data => {
				const blob = new Blob([Buffer.from(data.pdf, 'base64')], {
					type: 'application/pdf',
				});
				const url = window.URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = data.filename;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				window.URL.revokeObjectURL(url);
			},
		}),
	);

	const handleDownload = () => {
		downloadPdf({ handle, id: invoice.id });
	};

	// Status timeline events
	const timelineEvents = [
		{
			label: 'Created',
			date: invoice.createdAt,
			active: true,
		},
		{
			label: 'Sent',
			date: invoice.sentAt,
			active: !!invoice.sentAt,
		},
		{
			label: 'Viewed',
			date: invoice.viewedAt,
			active: !!invoice.viewedAt,
		},
		{
			label: 'Paid',
			date: invoice.paidAt,
			active: !!invoice.paidAt,
		},
	];

	return (
		<div className='space-y-6'>
			{/* Actions Bar */}
			<Card>
				<div className='flex flex-wrap items-center justify-between gap-3 px-6 py-3'>
					<Badge variant={getStatusColor(displayStatus)} className='text-sm'>
						{isOverdue ? 'Overdue' : getStatusLabel(invoice.status)}
					</Badge>

					<div className='flex flex-wrap items-center gap-2'>
						{isDraft && (
							<Button
								size='sm'
								look='outline'
								startIcon='edit'
								href={`/${handle}/invoices/${invoice.id}/edit`}
							>
								Edit
							</Button>
						)}

						{invoice.status !== 'paid' && invoice.status !== 'voided' && (
							<Button
								size='sm'
								look={isDraft ? undefined : 'outline'}
								onClick={() => sendInvoice({ handle, id: invoice.id })}
								disabled={isSending}
								startIcon='send'
							>
								{isSending ?
									'Sending...'
								: invoice.sentAt ?
									'Resend Invoice'
								:	'Send Invoice'}
							</Button>
						)}

						{(invoice.status === 'sent' || invoice.status === 'viewed') && (
							<Button
								size='sm'
								look='outline'
								onClick={() => markPaid({ handle, id: invoice.id, paidAt: new Date() })}
								disabled={isMarkingPaid}
								startIcon='check'
							>
								{isMarkingPaid ? 'Marking...' : 'Mark as Paid'}
							</Button>
						)}

						<Button size='sm' look='outline' onClick={copyPaymentLink} startIcon='link'>
							Copy Link
						</Button>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button size='sm' look='outline' variant='icon'>
									<Icon.more className='h-4 w-4' />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end'>
								<DropdownMenuItem
									onClick={handleDownload}
									disabled={isDownloading}
									className='cursor-pointer'
								>
									<Icon.download className='mr-2 h-4 w-4' />
									{isDownloading ? 'Downloading...' : 'Download PDF'}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => duplicateInvoice({ handle, id: invoice.id })}
									disabled={isDuplicating}
									className='cursor-pointer'
								>
									<Icon.copy className='mr-2 h-4 w-4' />
									{isDuplicating ? 'Duplicating...' : 'Duplicate'}
								</DropdownMenuItem>
								{invoice.status !== 'paid' && invoice.status !== 'voided' && (
									<>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() => setShowDeleteConfirm(true)}
											disabled={isDeleting}
											className='cursor-pointer text-destructive focus:text-destructive'
										>
											<Icon.trash className='mr-2 h-4 w-4' />
											{isDeleting ? 'Deleting...' : 'Delete'}
										</DropdownMenuItem>
									</>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</Card>

			{/* Main Content: Invoice Render + Sidebar */}
			<div className='grid gap-6 lg:grid-cols-3'>
				{/* Invoice Document */}
				<div className='lg:col-span-2'>
					<div className='overflow-hidden rounded-lg border bg-white shadow-sm'>
						<InvoiceRender
							invoice={invoice}
							workspace={workspace}
							client={invoice.client}
						/>
					</div>
				</div>

				{/* Sidebar */}
				<div className='space-y-6 lg:col-span-1'>
					{/* Invoice Summary */}
					<Card className='sticky top-4'>
						<div className='p-6 pb-3'>
							<h3 className='text-lg font-semibold'>Summary</h3>
						</div>
						<div className='px-6 pb-6'>
							<div className='space-y-2'>
								<div className='flex justify-between'>
									<Text variant='sm/normal' className='text-muted-foreground'>
										Subtotal
									</Text>
									<Text variant='sm/normal'>
										{formatMinorToMajorCurrency(invoice.subtotal, currency)}
									</Text>
								</div>
								{invoice.tax > 0 && (
									<div className='flex justify-between'>
										<Text variant='sm/normal' className='text-muted-foreground'>
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

						{/* Status Timeline */}
						<Separator />
						<div className='p-6'>
							<h4 className='mb-4 text-sm font-semibold text-muted-foreground'>
								Activity
							</h4>
							<div className='space-y-3'>
								{timelineEvents.map((event, index) => (
									<div key={event.label} className='flex items-start gap-3'>
										<div className='flex flex-col items-center'>
											<div
												className={`h-2.5 w-2.5 rounded-full ${
													event.active ? 'bg-primary' : 'bg-muted'
												}`}
											/>
											{index < timelineEvents.length - 1 && (
												<div
													className={`mt-1 h-5 w-px ${
														event.active ? 'bg-primary/30' : 'bg-muted'
													}`}
												/>
											)}
										</div>
										<div className='-mt-0.5 flex-1'>
											<Text
												variant='sm/medium'
												className={
													event.active ? 'text-foreground' : 'text-muted-foreground'
												}
											>
												{event.label}
											</Text>
											{event.date && (
												<Text variant='xs/normal' className='text-muted-foreground'>
													{format(new Date(event.date), 'MMM dd, yyyy h:mm a')}
												</Text>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					</Card>
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			<AlertDialogRoot open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Invoice</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete invoice {invoice.invoiceNumber}? This action
							cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => deleteInvoice({ handle, ids: [invoice.id] })}
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialogRoot>
		</div>
	);
}

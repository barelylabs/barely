'use client';

import type { InvoiceLineItem } from '@barely/validators';
import { useState } from 'react';
import { notFound } from 'next/navigation';
import { formatCentsToDollars } from '@barely/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

import { useInvoiceRenderTRPC } from '@barely/api/public/invoice-render.trpc.react';

import { Badge } from '@barely/ui/badge';
import { Button } from '@barely/ui/button';
import { Card } from '@barely/ui/card';
import { Icon } from '@barely/ui/icon';
import { LoadingSpinner } from '@barely/ui/loading';
import { Separator } from '@barely/ui/separator';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@barely/ui/table';
import { Text } from '@barely/ui/typography';

interface PageProps {
	params: {
		handle: string;
		invoiceId: string;
	};
}

export default function InvoicePaymentPage({ params }: PageProps) {
	const [isProcessing, setIsProcessing] = useState(false);
	const trpc = useInvoiceRenderTRPC();

	// Get invoice data
	const {
		data: invoice,
		isLoading,
		error,
	} = useQuery({
		...trpc.getInvoiceByHandle.queryOptions({
			handle: params.handle,
			invoiceId: params.invoiceId,
		}),
		retry: false,
	});

	// Create payment session mutation
	const createPaymentSession = useMutation({
		...trpc.createPaymentSession.mutationOptions(),
		onSuccess: data => {
			// Redirect to Stripe Checkout
			if (data.sessionUrl) {
				window.location.href = data.sessionUrl;
			}
		},
		onError: error => {
			console.error('Payment error:', error);
			setIsProcessing(false);
		},
	});

	const handlePayment = () => {
		setIsProcessing(true);
		createPaymentSession.mutate({
			handle: params.handle,
			invoiceId: params.invoiceId,
		});
	};

	if (isLoading) {
		return (
			<div className='flex min-h-screen items-center justify-center'>
				<div className='text-center'>
					<LoadingSpinner />
					<Text variant='sm/normal' muted className='mt-2'>
						Loading invoice...
					</Text>
				</div>
			</div>
		);
	}

	if (error || !invoice) {
		return notFound();
	}

	const lineItems = (
		Array.isArray(invoice.lineItems) ?
			invoice.lineItems
		:	[]) as InvoiceLineItem[];

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

	return (
		<div className='min-h-screen bg-gradient-to-b from-background to-muted py-8'>
			<div className='mx-auto max-w-3xl px-4'>
				{/* Header */}
				<div className='mb-8'>
					<div className='flex items-center justify-between'>
						<div>
							<h1 className='text-3xl font-bold'>{invoice.workspace.name}</h1>
							<Text variant='md/normal' muted className='mt-1'>
								Invoice #{invoice.invoiceNumber}
							</Text>
						</div>
						<Badge variant={getStatusColor(invoice.status)} className='text-sm'>
							{invoice.status.toUpperCase()}
						</Badge>
					</div>
				</div>

				{/* Invoice Details */}
				<div className='grid gap-6 lg:grid-cols-3'>
					<div className='space-y-6 lg:col-span-2'>
						{/* Client Information */}
						<Card>
							<Text variant='lg/semibold' className='mb-4'>
								Bill To
							</Text>
							<div className='space-y-1'>
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
						</Card>

						{/* Line Items */}
						<Card>
							<Text variant='lg/semibold' className='mb-4'>
								Items
							</Text>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Description</TableHead>
										<TableHead className='text-center'>Qty</TableHead>
										<TableHead className='text-right'>Rate</TableHead>
										<TableHead className='text-right'>Amount</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{lineItems.map((item, index) => (
										<TableRow key={index}>
											<TableCell>{item.description}</TableCell>
											<TableCell className='text-center'>{item.quantity}</TableCell>
											<TableCell className='text-right'>
												{formatCentsToDollars(item.rate)}
											</TableCell>
											<TableCell className='text-right font-medium'>
												{formatCentsToDollars(item.amount)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</Card>

						{/* Invoice Dates */}
						<Card>
							<Text variant='lg/semibold' className='mb-4'>
								Invoice Details
							</Text>
							<div className='grid gap-4 sm:grid-cols-2'>
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
										{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
									</Text>
								</div>
							</div>
						</Card>
					</div>

					{/* Payment Summary */}
					<div className='lg:col-span-1'>
						<Card className='sticky top-4'>
							<Text variant='lg/semibold' className='mb-4'>
								Payment Summary
							</Text>
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
									<Text variant='md/semibold'>Total Due</Text>
									<Text variant='md/semibold'>{formatCentsToDollars(invoice.total)}</Text>
								</div>
							</div>

							{/* Payment Actions */}
							<div className='mt-6'>
								{invoice.status === 'paid' ?
									<div className='text-center'>
										<div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
											<Icon.check className='h-6 w-6 text-green-600' />
										</div>
										<Text variant='md/medium' className='text-green-800'>
											Payment Complete
										</Text>
										<Text variant='sm/normal' className='mt-1 text-green-600'>
											This invoice has been paid in full
										</Text>
									</div>
								: invoice.status === 'voided' ?
									<div className='text-center'>
										<div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100'>
											<Icon.x className='h-6 w-6 text-gray-600' />
										</div>
										<Text variant='md/medium' className='text-gray-800'>
											Invoice Voided
										</Text>
										<Text variant='sm/normal' className='mt-1 text-gray-600'>
											This invoice has been cancelled
										</Text>
									</div>
								:	<div className='space-y-3'>
										<Button
											className='w-full'
											size='lg'
											onClick={handlePayment}
											disabled={isProcessing}
										>
											{isProcessing ?
												<>
													<LoadingSpinner className='mr-2 h-4 w-4' />
													Processing...
												</>
											:	<>
													<Icon.creditCard className='mr-2 h-4 w-4' />
													Pay {formatCentsToDollars(invoice.total)}
												</>
											}
										</Button>
										<Text variant='xs/normal' muted className='text-center'>
											Powered by Stripe • Secure payment
										</Text>
									</div>
								}
							</div>
						</Card>
					</div>
				</div>

				{/* Footer */}
				<div className='mt-12 text-center'>
					<Text variant='sm/normal' muted>
						Questions about this invoice? Contact {invoice.workspace.name}
					</Text>
				</div>
			</div>
		</div>
	);
}

'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';

import { useInvoiceRenderTRPC } from '@barely/api/public/invoice-render.trpc.react';

import { Button } from '@barely/ui/button';
import { Card } from '@barely/ui/card';
import { Icon } from '@barely/ui/icon';
import { InvoiceRender } from '@barely/ui/invoice';
import { LoadingSpinner } from '@barely/ui/loading';
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

	// Download PDF mutation
	const downloadPdf = useMutation(
		trpc.downloadInvoicePdf.mutationOptions({
			onSuccess: data => {
				// Create download link
				const blob = new Blob([Buffer.from(data.pdf, 'base64')], {
					type: 'application/pdf',
				});
				const url = window.URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = `invoice-${invoice?.invoiceNumber ?? 'download'}.pdf`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				window.URL.revokeObjectURL(url);
			},
		}),
	);

	const handlePayment = () => {
		setIsProcessing(true);
		createPaymentSession.mutate({
			handle: params.handle,
			invoiceId: params.invoiceId,
		});
	};

	const handleDownload = () => {
		downloadPdf.mutate({
			handle: params.handle,
			invoiceId: params.invoiceId,
		});
	};

	if (isLoading) {
		return (
			<div className='flex min-h-screen items-center justify-center bg-gray-50'>
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

	// Invoice is already paid
	const isPaid = invoice.status === 'paid';
	const isVoided = invoice.status === 'voided';

	return (
		<div className='min-h-screen bg-gray-50'>
			{/* Header */}
			<div className='border-b bg-white'>
				<div className='mx-auto max-w-5xl px-4 py-6'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-3'>
							<Text variant='xl/semibold' className='text-gray-900'>
								{invoice.workspace.name} sent you an invoice
							</Text>
						</div>
						<Button
							size='sm'
							look='outline'
							startIcon='download'
							onClick={handleDownload}
							disabled={downloadPdf.isPending}
						>
							{downloadPdf.isPending ? 'Downloading...' : 'Download Invoice'}
						</Button>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className='mx-auto max-w-5xl px-4 py-8'>
				<div className='grid gap-8 lg:grid-cols-3'>
					{/* Invoice Preview */}
					<div className='lg:col-span-2'>
						<Card className='overflow-hidden p-0'>
							<InvoiceRender
								invoice={invoice}
								workspace={invoice.workspace}
								client={invoice.client}
								isPreview={false}
							/>
						</Card>
					</div>

					{/* Payment Section */}
					<div className='lg:col-span-1'>
						<Card className='sticky top-4'>
							<div className='p-6'>
								<Text variant='lg/semibold' className='mb-6 text-gray-900'>
									Payment Details
								</Text>

								{/* Amount Display */}
								<div className='mb-6 rounded-lg bg-gray-50 p-4'>
									<div className='flex items-center justify-between'>
										<Text variant='2xl/semibold' className='text-gray-900'>
											{new Intl.NumberFormat('en-US', {
												style: 'currency',
												currency: invoice.workspace.currency.toUpperCase(),
												minimumFractionDigits: 0,
												maximumFractionDigits: 2,
											}).format(invoice.total / 100)}
										</Text>
										<Text variant='sm/normal' className='text-gray-500'>
											INV-{invoice.invoiceNumber}
										</Text>
									</div>
									<Text variant='sm/normal' className='mt-2 text-gray-600'>
										Due on{' '}
										{new Date(invoice.dueDate).toLocaleDateString('en-US', {
											month: 'long',
											day: 'numeric',
											year: 'numeric',
										})}
									</Text>
								</div>

								{/* Payment Status/Actions */}
								{isPaid ?
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
								: isVoided ?
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
								:	<div className='space-y-4'>
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
													Pay Now
												</>
											}
										</Button>

										<Text variant='xs/normal' muted className='text-center'>
											Powered by Stripe • Secure payment
										</Text>
									</div>
								}

								{/* Additional Info */}
								<div className='mt-6 border-t pt-6'>
									<Text variant='sm/semibold' className='mb-3 text-gray-700'>
										Payment methods
									</Text>
									<div className='space-y-2'>
										<div className='flex items-center gap-2 text-gray-600'>
											<Icon.creditCard className='h-4 w-4' />
											<Text variant='sm/normal'>Card</Text>
										</div>
										<div className='flex items-center gap-2 text-gray-600'>
											<Icon.billing className='h-4 w-4' />
											<Text variant='sm/normal'>ACH Bank Transfer</Text>
										</div>
									</div>
								</div>

								{/* Contact Info */}
								<div className='mt-6 border-t pt-6'>
									<Text variant='xs/normal' className='text-center text-gray-500'>
										Questions? Contact {invoice.workspace.name}
										{(invoice.workspace.invoiceSupportEmail ??
											invoice.workspace.supportEmail) && (
											<>
												{' '}
												at{' '}
												<a
													href={`mailto:${invoice.workspace.invoiceSupportEmail ?? invoice.workspace.supportEmail}`}
													className='text-blue-600 hover:underline'
												>
													{invoice.workspace.invoiceSupportEmail ??
														invoice.workspace.supportEmail}
												</a>
											</>
										)}
									</Text>
								</div>
							</div>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}

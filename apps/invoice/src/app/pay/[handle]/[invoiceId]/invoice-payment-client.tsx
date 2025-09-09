'use client';

import type { InvoiceRenderRouterOutputs } from '@barely/api/public/invoice-render.router';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { useInvoiceRenderTRPC } from '@barely/api/public/invoice-render.trpc.react';

import { Button } from '@barely/ui/button';
import { Card } from '@barely/ui/card';
import { Icon } from '@barely/ui/icon';
import { InvoiceRender } from '@barely/ui/invoice';
// import { LoadingSpinner } from '@barely/ui/loading';
import { Text } from '@barely/ui/typography';

import { OneTimePaymentModal } from './_components/one-time-payment-modal';
import { PaymentTypeToggle } from './_components/payment-type-toggle';
import { RecurringPaymentModal } from './_components/recurring-payment-modal';

// Payment options type (matching the component)
interface PaymentOptions {
	oneTime: { total: number; label: string };
	recurring: {
		total: number;
		originalTotal: number;
		discountAmount: number;
		discountPercent: number;
		billingInterval: string;
		annualSavings: number;
		label: string;
	};
	currency: 'usd' | 'gbp';
}

interface PaymentIntentData {
	clientSecret: string;
	stripeConnectAccountId: string;
}

interface InvoicePaymentClientProps {
	handle: string;
	invoiceId: string;
	invoice: InvoiceRenderRouterOutputs['getInvoiceByHandle'];
	paymentIntentData: PaymentIntentData | null;
	setupIntentData: PaymentIntentData | null;
	paymentOptions: PaymentOptions | null;
}

export function InvoicePaymentClient({
	handle,
	invoiceId,
	invoice,
	paymentIntentData,
	setupIntentData,
	paymentOptions,
}: InvoicePaymentClientProps) {
	// Modal state
	const [showOneTimeModal, setShowOneTimeModal] = useState(false);
	const [showRecurringModal, setShowRecurringModal] = useState(false);
	const [paymentError, setPaymentError] = useState<string | null>(null);

	// Payment type selection for recurringOptional invoices - default to recurring for better UX
	const [selectedPaymentType, setSelectedPaymentType] = useState<'oneTime' | 'recurring'>(
		invoice.type === 'recurring' || invoice.type === 'recurringOptional' ?
			'recurring'
		:	'oneTime',
	);

	const trpc = useInvoiceRenderTRPC();

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
				link.download = `${invoice.workspace.name}-${invoice.invoiceNumber}.pdf`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				window.URL.revokeObjectURL(url);
			},
		}),
	);

	const handlePayment = () => {
		// Open appropriate modal based on invoice type and selection
		if (invoice.type === 'oneTime') {
			setShowOneTimeModal(true);
		} else if (invoice.type === 'recurring') {
			setShowRecurringModal(true);
		} else {
			// recurringOptional
			if (selectedPaymentType === 'recurring') {
				setShowRecurringModal(true);
			} else {
				setShowOneTimeModal(true);
			}
		}
	};

	// Helper functions
	const getButtonText = () => {
		if (invoice.type === 'oneTime') {
			return 'Pay Now';
		} else if (invoice.type === 'recurring') {
			return 'Set up Auto-Pay';
		} else {
			return selectedPaymentType === 'recurring' ? 'Set up Auto-Pay' : 'Pay Now';
		}
	};

	const handleDownload = () => {
		downloadPdf.mutate({
			handle,
			invoiceId,
		});
	};

	const handlePaymentError = (error: string) => {
		setPaymentError(error);
	};

	// Check if payment data is available
	const hasPaymentData =
		(invoice.type === 'oneTime' && paymentIntentData) ??
		(invoice.type === 'recurring' && setupIntentData) ??
		(invoice.type === 'recurringOptional' && paymentIntentData && setupIntentData);

	// Invoice status checks
	const isPaid = invoice.status === 'paid';
	const isVoided = invoice.status === 'voided';

	return (
		<div className='min-h-screen bg-gray-50'>
			{/* Header */}
			<div className='border-b bg-white'>
				<div className='mx-auto max-w-6xl px-4 py-6'>
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
			<div className='mx-auto max-w-6xl px-4 py-8'>
				<div className='grid gap-8 lg:grid-cols-5'>
					{/* Invoice Preview */}
					<div className='lg:col-span-3'>
						<Card className='overflow-hidden p-0'>
							<InvoiceRender
								invoice={invoice}
								workspace={invoice.workspace}
								client={{
									...invoice.client,
									addressLine1: null,
									addressLine2: null,
									city: null,
									state: null,
									postalCode: null,
									country: null,
								}}
								isPreview={false}
							/>
						</Card>
					</div>

					{/* Payment Section - Now wider */}
					<div className='lg:col-span-2'>
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
											{invoice.invoiceNumber}
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

								{/* Payment Type Toggle for recurringOptional */}
								{invoice.type === 'recurringOptional' && paymentOptions && (
									<div className='mb-6'>
										<PaymentTypeToggle
											options={paymentOptions}
											selectedType={selectedPaymentType}
											onTypeChange={setSelectedPaymentType}
										/>
									</div>
								)}

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
										{paymentError && (
											<div className='rounded-md border border-red-200 bg-red-50 p-3'>
												<Text variant='sm/medium' className='text-red-800'>
													{paymentError}
												</Text>
											</div>
										)}

										{!hasPaymentData && (
											<div className='rounded-md border border-yellow-200 bg-yellow-50 p-3'>
												<Text variant='sm/medium' className='text-yellow-800'>
													Payment processing is temporarily unavailable. Please try again
													later.
												</Text>
											</div>
										)}

										<Button
											className='w-full'
											size='lg'
											look='brand'
											onClick={handlePayment}
											disabled={!hasPaymentData}
										>
											<Icon.creditCard className='mr-2 h-4 w-4' />
											{getButtonText()}
										</Button>

										<Text
											variant='xs/normal'
											className='text-center text-muted-foreground'
										>
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
										Questions?{' '}
										{(
											(invoice.workspace.invoiceSupportEmail ??
											invoice.workspace.supportEmail)
										) ?
											<a
												href={`mailto:${invoice.workspace.invoiceSupportEmail ?? invoice.workspace.supportEmail}`}
												className='text-blue-600 hover:underline'
											>
												Contact {invoice.workspace.name}
											</a>
										:	`Contact ${invoice.workspace.name}`}
									</Text>
								</div>
							</div>
						</Card>
					</div>
				</div>
			</div>

			{/* Payment Modals */}
			{paymentIntentData && (
				<OneTimePaymentModal
					handle={handle}
					invoiceId={invoiceId}
					invoice={invoice}
					clientSecret={paymentIntentData.clientSecret}
					stripeConnectAccountId={paymentIntentData.stripeConnectAccountId}
					showModal={showOneTimeModal}
					setShowModal={setShowOneTimeModal}
					onError={handlePaymentError}
				/>
			)}

			{setupIntentData && (
				<RecurringPaymentModal
					handle={handle}
					invoiceId={invoiceId}
					invoice={invoice}
					clientSecret={setupIntentData.clientSecret}
					stripeConnectAccountId={setupIntentData.stripeConnectAccountId}
					paymentOptions={paymentOptions}
					showModal={showRecurringModal}
					setShowModal={setShowRecurringModal}
					onError={handlePaymentError}
				/>
			)}
		</div>
	);
}

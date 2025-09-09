'use client';

import type { InvoiceRenderRouterOutputs } from '@barely/api/public/invoice-render.router';

import { Modal } from '@barely/ui/modal';
import { Text } from '@barely/ui/typography';

import { ElementsProvider } from './elements-provider';
import { EmbeddedPaymentForm } from './embedded-payment-form';

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

interface RecurringPaymentModalProps {
	handle: string;
	invoiceId: string;
	invoice: InvoiceRenderRouterOutputs['getInvoiceByHandle'];
	clientSecret: string;
	stripeConnectAccountId: string;
	paymentOptions?: PaymentOptions | null;
	showModal: boolean;
	setShowModal: (show: boolean) => void;
	onSuccess?: () => void;
	onError?: (error: string) => void;
}

export function RecurringPaymentModal({
	handle,
	invoiceId,
	invoice,
	clientSecret,
	stripeConnectAccountId,
	paymentOptions,
	showModal,
	setShowModal,
	onSuccess,
	onError,
}: RecurringPaymentModalProps) {
	const handlePaymentSuccess = () => {
		setShowModal(false);
		onSuccess?.();
		// User will be redirected by Stripe to success page
	};

	const handlePaymentError = (error: string) => {
		onError?.(error);
	};

	const hasDiscount =
		paymentOptions?.recurring.discountPercent &&
		paymentOptions.recurring.discountPercent > 0;

	return (
		<Modal showModal={showModal} setShowModal={setShowModal} className='max-w-md'>
			<div className='p-6'>
				<div className='mb-4 text-center'>
					<Text variant='lg/semibold' className='text-gray-900'>
						Set Up Auto-Pay
					</Text>

					{paymentOptions ?
						<>
							<Text variant='sm/normal' className='mt-1 text-gray-500'>
								{hasDiscount ?
									<>
										<span className='line-through'>
											{new Intl.NumberFormat('en-US', {
												style: 'currency',
												currency: invoice.workspace.currency.toUpperCase(),
												minimumFractionDigits: 0,
												maximumFractionDigits: 2,
											}).format(invoice.total / 100)}
										</span>{' '}
										<span className='font-semibold text-green-600'>
											{new Intl.NumberFormat('en-US', {
												style: 'currency',
												currency: paymentOptions.currency.toUpperCase(),
												minimumFractionDigits: 0,
												maximumFractionDigits: 2,
											}).format(paymentOptions.recurring.total / 100)}
										</span>
									</>
								:	<>
										{new Intl.NumberFormat('en-US', {
											style: 'currency',
											currency: invoice.workspace.currency.toUpperCase(),
											minimumFractionDigits: 0,
											maximumFractionDigits: 2,
										}).format(invoice.total / 100)}
									</>
								}{' '}
								per {paymentOptions.recurring.billingInterval}
							</Text>
							{hasDiscount && (
								<Text variant='xs/normal' className='mt-1 text-green-600'>
									Save {paymentOptions.recurring.discountPercent}%
								</Text>
							)}
						</>
					:	<Text variant='sm/normal' className='mt-1 text-gray-500'>
							{new Intl.NumberFormat('en-US', {
								style: 'currency',
								currency: invoice.workspace.currency.toUpperCase(),
								minimumFractionDigits: 0,
								maximumFractionDigits: 2,
							}).format(invoice.total / 100)}
							{invoice.billingInterval ? ` per ${invoice.billingInterval}` : ''}
						</Text>
					}
				</div>

				<ElementsProvider
					clientSecret={clientSecret}
					stripeConnectAccountId={stripeConnectAccountId}
				>
					<EmbeddedPaymentForm
						handle={handle}
						invoiceId={invoiceId}
						onSuccess={handlePaymentSuccess}
						onError={handlePaymentError}
					/>
				</ElementsProvider>
			</div>
		</Modal>
	);
}

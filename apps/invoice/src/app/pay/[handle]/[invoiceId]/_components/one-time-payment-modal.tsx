'use client';

import type { InvoiceRenderRouterOutputs } from '@barely/api/public/invoice-render.router';

import { Modal } from '@barely/ui/modal';
import { Text } from '@barely/ui/typography';

import { ElementsProvider } from './elements-provider';
import { EmbeddedPaymentForm } from './embedded-payment-form';

interface OneTimePaymentModalProps {
	handle: string;
	invoiceId: string;
	invoice: InvoiceRenderRouterOutputs['getInvoiceByHandle'];
	clientSecret: string;
	stripeConnectAccountId: string;
	showModal: boolean;
	setShowModal: (show: boolean) => void;
	onSuccess?: () => void;
	onError?: (error: string) => void;
}

export function OneTimePaymentModal({
	handle,
	invoiceId,
	invoice,
	clientSecret,
	stripeConnectAccountId,
	showModal,
	setShowModal,
	onSuccess,
	onError,
}: OneTimePaymentModalProps) {
	const handlePaymentSuccess = () => {
		setShowModal(false);
		onSuccess?.();
		// User will be redirected by Stripe to success page
	};

	const handlePaymentError = (error: string) => {
		onError?.(error);
	};

	return (
		<Modal showModal={showModal} setShowModal={setShowModal} className='max-w-md'>
			<div className='p-6'>
				<div className='mb-4 text-center'>
					<Text variant='lg/semibold' className='text-gray-900'>
						Complete Payment
					</Text>
					<Text variant='sm/normal' className='mt-1 text-gray-500'>
						{new Intl.NumberFormat('en-US', {
							style: 'currency',
							currency: invoice.workspace.currency.toUpperCase(),
							minimumFractionDigits: 0,
							maximumFractionDigits: 2,
						}).format(invoice.total / 100)}
					</Text>
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

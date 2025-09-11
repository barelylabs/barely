'use client';

import { useState } from 'react';
import { getAbsoluteUrl } from '@barely/utils';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';

import { Button } from '@barely/ui/button';
import { LoadingSpinner } from '@barely/ui/loading';
import { Text } from '@barely/ui/typography';

interface EmbeddedPaymentFormProps {
	handle: string;
	invoiceId: string;
	onSuccess?: () => void;
	onError?: (error: string) => void;
}

export function EmbeddedPaymentForm({
	handle,
	invoiceId,
	onSuccess,
	onError,
}: EmbeddedPaymentFormProps) {
	const stripe = useStripe();
	const elements = useElements();
	const [isProcessing, setIsProcessing] = useState(false);
	const [paymentReady, setPaymentReady] = useState(false);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!stripe || !elements) {
			return;
		}

		setIsProcessing(true);

		try {
			const result = await stripe.confirmPayment({
				elements,
				confirmParams: {
					return_url: getAbsoluteUrl('invoice', `pay/${handle}/${invoiceId}/success`),
				},
			});

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (result.error) {
				console.error('Payment error:', result.error);
				onError?.(result.error.message ?? 'Payment failed');
				return;
			}

			// Payment succeeded, user will be redirected to return_url
			onSuccess?.();
		} catch (error) {
			console.error('Payment error:', error);
			onError?.(error instanceof Error ? error.message : 'Payment failed');
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className='space-y-6'>
			<div className='space-y-4'>
				<Text variant='lg/semibold' className='text-gray-900'>
					Payment Information
				</Text>

				<div className='rounded-lg border border-gray-200 p-4'>
					{!paymentReady && (
						<div className='space-y-3'>
							{/* Card number skeleton */}
							<div className='space-y-1'>
								<div className='h-3 w-24 animate-pulse rounded bg-gray-200' />
								<div className='h-10 animate-pulse rounded-md border border-gray-200 bg-gray-100' />
							</div>

							{/* Expiry and CVC row */}
							<div className='grid grid-cols-2 gap-3'>
								<div className='space-y-1'>
									<div className='h-3 w-16 animate-pulse rounded bg-gray-200' />
									<div className='h-10 animate-pulse rounded-md border border-gray-200 bg-gray-100' />
								</div>
								<div className='space-y-1'>
									<div className='h-3 w-12 animate-pulse rounded bg-gray-200' />
									<div className='h-10 animate-pulse rounded-md border border-gray-200 bg-gray-100' />
								</div>
							</div>
						</div>
					)}

					<PaymentElement
						onReady={() => setPaymentReady(true)}
						options={{
							layout: 'tabs',
						}}
					/>
				</div>

				<Text variant='xs/normal' className='text-center text-gray-500'>
					Your payment information is secure and encrypted
				</Text>
			</div>

			<Button
				type='submit'
				size='lg'
				look='brand'
				className='w-full'
				disabled={!stripe || !elements || isProcessing}
			>
				{isProcessing ?
					<>
						<LoadingSpinner className='mr-2 h-4 w-4' />
						Processing Payment...
					</>
				:	'Complete Payment'}
			</Button>
		</form>
	);
}

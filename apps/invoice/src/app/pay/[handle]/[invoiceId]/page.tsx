import { trpcCaller } from '~/trpc/server';
import { InvoicePaymentClient } from './invoice-payment-client';

interface PageProps {
	params: Promise<{
		handle: string;
		invoiceId: string;
	}>;
}

export default async function InvoicePaymentPage({ params }: PageProps) {
	const { handle, invoiceId } = await params;

	// Fetch invoice data on the server
	const invoice = await trpcCaller
		.getInvoiceByHandle({ handle, invoiceId })
		.catch(error => {
			console.error('Failed to fetch invoice:', error);
			return null;
		});

	if (!invoice) {
		return (
			<div className='flex min-h-screen items-center justify-center bg-gray-50'>
				<div className='text-center'>
					<p className='text-lg font-semibold text-gray-900'>Invoice not found</p>
					<p className='mt-2 text-sm text-gray-600'>
						This invoice may have been deleted or does not exist.
					</p>
				</div>
			</div>
		);
	}

	// Initialize payment intents based on invoice type
	let paymentIntentData = null;
	let setupIntentData = null;
	let paymentOptions = null;

	try {
		if (invoice.type === 'oneTime') {
			// Initialize only payment intent for one-time invoices
			paymentIntentData = await trpcCaller.createPaymentIntent({
				handle,
				invoiceId,
			});
		} else if (invoice.type === 'recurring') {
			// Initialize only setup intent for recurring invoices
			setupIntentData = await trpcCaller.createRecurringPayment({
				handle,
				invoiceId,
				customerEmail: invoice.client.email,
			});
		} else {
			// Initialize both for optional recurring invoices
			// Also fetch payment options
			const [paymentIntent, setupIntent, options] = await Promise.all([
				trpcCaller.createPaymentIntent({
					handle,
					invoiceId,
					paymentType: 'oneTime',
				}),
				trpcCaller.createRecurringPayment({
					handle,
					invoiceId,
					customerEmail: invoice.client.email,
				}),
				trpcCaller.getRecurringPaymentOptions({ handle, invoiceId }),
			]);

			paymentIntentData = paymentIntent;
			setupIntentData = setupIntent;
			paymentOptions = options;
		}
	} catch (error) {
		console.error('Failed to initialize payment:', error);
		// We'll handle this error in the client component
	}

	return (
		<InvoicePaymentClient
			handle={handle}
			invoiceId={invoiceId}
			invoice={invoice}
			paymentIntentData={paymentIntentData}
			setupIntentData={setupIntentData}
			paymentOptions={paymentOptions}
		/>
	);
}

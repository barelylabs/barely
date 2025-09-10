import { Button } from '@barely/ui/button';
import { Card } from '@barely/ui/card';
import { Icon } from '@barely/ui/icon';
import { H, Text } from '@barely/ui/typography';

interface PageProps {
	params: {
		handle: string;
		invoiceId: string;
	};
}

export default function PaymentSuccessPage({ params }: PageProps) {
	return (
		<div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted'>
			<div className='mx-auto max-w-md px-4'>
				<Card className='py-12 text-center'>
					<div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
						<Icon.checkCircle className='h-10 w-10 text-green-600' />
					</div>

					<H size='3' className='mb-2'>
						Payment Successful!
					</H>

					<Text variant='md/normal' muted className='mb-8'>
						Thank you for your payment. You'll receive a confirmation email shortly.
					</Text>

					<div className='space-y-3'>
						<Button className='w-full' href={`/pay/${params.handle}/${params.invoiceId}`}>
							View Invoice
						</Button>
					</div>
				</Card>
			</div>
		</div>
	);
}

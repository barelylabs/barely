import { getAbsoluteUrl } from '@barely/utils';

import { Button } from '@barely/ui/button';
import { Card } from '@barely/ui/card';
import { Icon } from '@barely/ui/icon';
import { H, Text } from '@barely/ui/typography';

export default function InvoiceLandingPage() {
	return (
		<div className='min-h-screen bg-gradient-to-b from-background to-muted'>
			{/* Header */}
			<header className='border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
				<div className='container mx-auto flex h-16 items-center justify-between px-4'>
					<div className='flex items-center gap-2'>
						<Icon.receipt className='h-6 w-6' />
						<span className='text-xl font-semibold'>barely.invoice</span>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className='container mx-auto px-4 py-20'>
				<div className='mx-auto max-w-3xl text-center'>
					<H size='1' className='mb-4'>
						Simple Invoicing for Freelancers
					</H>
					<Text variant='lg/normal' muted className='mb-8'>
						Create professional invoices in seconds. Get paid faster with Stripe
						integration.
					</Text>
					<Button size='lg' href={getAbsoluteUrl('appInvoice')}>
						Get Started Free
					</Button>
				</div>
			</section>

			{/* Features */}
			<section className='container mx-auto px-4 py-16'>
				<div className='grid gap-8 md:grid-cols-3'>
					<Card>
						<Icon.clock className='mb-2 h-8 w-8 text-primary' />
						<H size='5'>60-Second Invoices</H>
						<Text variant='sm/normal' muted className='mt-2'>
							Create and send professional invoices in under a minute. No complex setup
							required.
						</Text>
					</Card>

					<Card>
						<Icon.creditCard className='mb-2 h-8 w-8 text-primary' />
						<H size='5'>Instant Payments</H>
						<Text variant='sm/normal' muted className='mt-2'>
							Accept payments instantly with Stripe. Your clients can pay with one click.
						</Text>
					</Card>

					<Card>
						<Icon.shield className='mb-2 h-8 w-8 text-primary' />
						<H size='5'>Secure & Reliable</H>
						<Text variant='sm/normal' muted className='mt-2'>
							Bank-level security with automatic backups. Your data is always safe and
							accessible.
						</Text>
					</Card>
				</div>
			</section>

			{/* CTA */}
			<section className='container mx-auto px-4 py-20'>
				<Card className='mx-auto max-w-2xl bg-primary py-12 text-center text-primary-foreground'>
					<H size='3' className='mb-4'>
						Ready to streamline your invoicing?
					</H>
					<Text variant='lg/normal' className='mb-8 opacity-90'>
						Join thousands of freelancers who save hours every month.
					</Text>
					<Button size='lg' look='outline' href='https://app.barely.ai'>
						Start Free Trial
					</Button>
				</Card>
			</section>

			{/* Footer */}
			<footer className='border-t py-8'>
				<div className='container mx-auto px-4 text-center'>
					<Text variant='sm/normal' muted>
						© 2024 barely.ai - Simple tools for creators
					</Text>
				</div>
			</footer>
		</div>
	);
}

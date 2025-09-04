import { Button } from '@barely/ui/button';
import { Card } from '@barely/ui/card';
import { Icon } from '@barely/ui/icon';
import { H, Text } from '@barely/ui/typography';

import { AnimatedSection } from '../shared/animated-section';
import { Container } from '../shared/container';

export function PricingSection() {
	return (
		<section id='pricing' className='py-24'>
			<Container>
				<AnimatedSection animation='fade-up' className='mb-12 text-center'>
					<H size='2' className='mb-4'>
						Pricing That's Barely There Too
					</H>
				</AnimatedSection>

				<div className='mx-auto grid max-w-4xl gap-8 md:grid-cols-2'>
					{/* Free Plan */}
					<AnimatedSection animation='fade-up' delay={100}>
						<Card className='h-full p-8'>
							<div className='mb-6'>
								<H size='3' className='mb-2'>
									Free Forever
								</H>
								<div className='flex items-baseline gap-1'>
									<span className='text-4xl font-bold'>$0</span>
									<span className='text-muted-foreground'>/month</span>
								</div>
								<Text variant='sm/normal' className='mt-2 text-muted-foreground'>
									Perfect for testing or occasional invoices
								</Text>
							</div>

							<ul className='mb-8 space-y-3'>
								<li className='flex items-start gap-2'>
									<Icon.check className='mt-0.5 h-5 w-5 text-primary' />
									<span className='text-sm'>3 invoices per month</span>
								</li>
								<li className='flex items-start gap-2'>
									<Icon.check className='mt-0.5 h-5 w-5 text-primary' />
									<span className='text-sm'>Unlimited clients</span>
								</li>
								<li className='flex items-start gap-2'>
									<Icon.check className='mt-0.5 h-5 w-5 text-primary' />
									<span className='text-sm'>Payment processing</span>
								</li>
								<li className='flex items-start gap-2'>
									<Icon.check className='mt-0.5 h-5 w-5 text-primary' />
									<span className='text-sm'>Basic invoice template</span>
								</li>
								<li className='flex items-start gap-2'>
									<Icon.check className='mt-0.5 h-5 w-5 text-primary' />
									<span className='text-sm'>7-day payment tracking</span>
								</li>
								<li className='flex items-start gap-2'>
									<Icon.x className='mt-0.5 h-5 w-5 text-muted-foreground' />
									<span className='text-sm text-muted-foreground'>
										"Sent with Barely Invoice" footer
									</span>
								</li>
								<li className='flex items-start gap-2'>
									<Icon.x className='mt-0.5 h-5 w-5 text-muted-foreground' />
									<span className='text-sm text-muted-foreground'>
										Recurring payments
									</span>
								</li>
								<li className='flex items-start gap-2'>
									<Icon.x className='mt-0.5 h-5 w-5 text-muted-foreground' />
									<span className='text-sm text-muted-foreground'>Custom branding</span>
								</li>
							</ul>

							<Button className='w-full' look='outline' href='#waitlist'>
								Start Free
							</Button>
						</Card>
					</AnimatedSection>

					{/* Pro Plan */}
					<AnimatedSection animation='fade-up' delay={200}>
						<Card className='relative h-full border-primary/20 bg-primary/5 p-8'>
							<div className='absolute -top-3 right-4 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground'>
								POPULAR
							</div>

							<div className='mb-6'>
								<H size='3' className='mb-2'>
									Pro
								</H>
								<div className='flex items-baseline gap-1'>
									<span className='text-4xl font-bold'>$9</span>
									<span className='text-muted-foreground'>/month</span>
								</div>
								<Text variant='sm/normal' className='mt-2 text-muted-foreground'>
									Everything you need to run your business
								</Text>
							</div>

							<ul className='mb-8 space-y-3'>
								<li className='flex items-start gap-2'>
									<Icon.check className='mt-0.5 h-5 w-5 text-primary' />
									<span className='text-sm'>Unlimited invoices</span>
								</li>
								<li className='flex items-start gap-2'>
									<Icon.check className='mt-0.5 h-5 w-5 text-primary' />
									<span className='text-sm'>Unlimited clients</span>
								</li>
								<li className='flex items-start gap-2'>
									<Icon.check className='mt-0.5 h-5 w-5 text-primary' />
									<span className='text-sm'>Payment processing</span>
								</li>
								<li className='flex items-start gap-2'>
									<Icon.check className='mt-0.5 h-5 w-5 text-primary' />
									<span className='text-sm'>5 professional templates</span>
								</li>
								<li className='flex items-start gap-2'>
									<Icon.check className='mt-0.5 h-5 w-5 text-primary' />
									<span className='text-sm'>30-day payment tracking</span>
								</li>
								<li className='flex items-start gap-2'>
									<Icon.check className='mt-0.5 h-5 w-5 text-primary' />
									<span className='text-sm'>Remove Barely branding</span>
								</li>
								<li className='flex items-start gap-2'>
									<Icon.check className='mt-0.5 h-5 w-5 text-primary' />
									<span className='text-sm font-medium'>
										Recurring payments & subscriptions
									</span>
								</li>
								<li className='flex items-start gap-2'>
									<Icon.check className='mt-0.5 h-5 w-5 text-primary' />
									<span className='text-sm'>Automated payment reminders</span>
								</li>
								<li className='flex items-start gap-2'>
									<Icon.check className='mt-0.5 h-5 w-5 text-primary' />
									<span className='text-sm'>Priority support</span>
								</li>
							</ul>

							<Button className='w-full' href='#waitlist'>
								Start Free Trial
							</Button>
							<Text
								variant='xs/normal'
								className='mt-2 text-center text-muted-foreground'
							>
								14 days free, then $9/month
							</Text>
						</Card>
					</AnimatedSection>
				</div>

				{/* Transaction Fee Notice */}
				<AnimatedSection animation='fade-up' delay={300}>
					<div className='mx-auto mt-12 max-w-4xl text-center'>
						<Card className='mx-auto px-6 py-4'>
							<Text variant='sm/normal' className='text-muted-foreground'>
								+ 0.5% transaction fee on all payments (on top of Stripe's fees)
							</Text>
							<Text variant='sm/normal' className='mt-1 text-muted-foreground'>
								We only make money when you make money.
							</Text>
						</Card>
					</div>
				</AnimatedSection>
			</Container>
		</section>
	);
}

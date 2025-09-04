'use client';

import { useEffect, useState } from 'react';

import { Card } from '@barely/ui/card';
import { Icon } from '@barely/ui/icon';
import { Switch } from '@barely/ui/switch';
import { H, Text } from '@barely/ui/typography';

import { AnimatedSection } from '../shared/animated-section';
import { Container } from '../shared/container';

export function SolutionFeatures() {
	const [seconds, setSeconds] = useState(0);
	const [isTimerActive, setIsTimerActive] = useState(false);
	const [showRecurring, setShowRecurring] = useState(false);

	useEffect(() => {
		let interval: NodeJS.Timeout | null = null;

		if (isTimerActive && seconds < 60) {
			interval = setInterval(() => {
				setSeconds(s => s + 1);
			}, 50); // Speed up for demo
		} else if (seconds >= 60) {
			setIsTimerActive(false);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isTimerActive, seconds]);

	const startTimer = () => {
		setSeconds(0);
		setIsTimerActive(true);
	};

	return (
		<section className='py-24'>
			<Container>
				<AnimatedSection animation='fade-up' className='mb-12 text-center'>
					<H size='2' className='mb-4'>
						Invoicing Stripped Down to What Actually Matters
					</H>
				</AnimatedSection>

				<div className='grid gap-8 md:grid-cols-3'>
					{/* 60-Second Invoices */}
					<AnimatedSection animation='fade-up' delay={100}>
						<Card className='relative h-full overflow-hidden p-6'>
							<div className='mb-4 flex items-start gap-3'>
								<Icon.zap className='h-8 w-8 flex-shrink-0 text-primary' />
								<H size='4' className='leading-tight'>
									60-Second Invoices
								</H>
							</div>
							<Text variant='sm/normal' className='mb-4 text-muted-foreground'>
								From Zero to Sent in 60 Seconds
							</Text>
							<Text variant='sm/normal' className='mb-6 text-muted-foreground'>
								No setup wizards. No account codes. No tax forms. Just who owes you, how
								much, and when.
							</Text>

							{/* Timer Demo */}
							<div
								className='cursor-pointer rounded-lg bg-muted p-4 transition-colors hover:bg-muted/80'
								onClick={startTimer}
							>
								<div className='mb-2 text-center text-3xl font-bold'>
									{String(Math.floor(seconds)).padStart(2, '0')}s
								</div>
								<Text variant='xs/normal' className='text-center text-muted-foreground'>
									{isTimerActive ? 'Creating invoice...' : 'Click to see timer'}
								</Text>
							</div>
						</Card>
					</AnimatedSection>

					{/* Instant Payments */}
					<AnimatedSection animation='fade-up' delay={200}>
						<Card className='h-full p-6'>
							<div className='mb-4 flex items-start gap-3'>
								<Icon.creditCard className='h-8 w-8 flex-shrink-0 text-primary' />
								<H size='4' className='leading-tight'>
									Instant Payments
								</H>
							</div>
							<Text variant='sm/normal' className='mb-4 text-muted-foreground'>
								One-Click Payment for Your Clients
							</Text>
							<Text variant='sm/normal' className='mb-6 text-muted-foreground'>
								Clients pay directly from the invoice email. No accounts, no friction.
								Money hits your Stripe instantly.
							</Text>

							{/* Pay Button Preview */}
							<div className='rounded-lg bg-muted p-4'>
								<button className='w-full rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90'>
									Pay Now →
								</button>
								<Text
									variant='xs/normal'
									className='mt-2 text-center text-muted-foreground'
								>
									Client sees this button
								</Text>
							</div>
						</Card>
					</AnimatedSection>

					{/* Recurring Revenue */}
					<AnimatedSection animation='fade-up' delay={300}>
						<Card className='h-full border-primary/20 bg-primary/5 p-6'>
							<div className='mb-4 flex items-start gap-3'>
								<Icon.repeat className='h-8 w-8 flex-shrink-0 text-primary' />
								<H size='4' className='leading-tight'>
									Recurring Revenue
								</H>
							</div>
							<Text variant='sm/normal' className='mb-4 text-muted-foreground'>
								Turn Projects into Predictable Income
							</Text>
							<Text variant='sm/normal' className='mb-6 text-muted-foreground'>
								Convert any invoice to a subscription with one toggle. Build the recurring
								revenue you've always wanted.
							</Text>

							{/* Recurring Toggle Demo */}
							<div className='rounded-lg bg-background p-4'>
								<div className='flex items-center justify-between'>
									<div>
										<Text variant='sm/semibold'>Monthly retainer</Text>
										<Text variant='sm/normal' className='text-muted-foreground'>
											{showRecurring ? '$2,000/mo' : '$2,000 once'}
										</Text>
									</div>
									<Switch checked={showRecurring} onCheckedChange={setShowRecurring} />
								</div>
							</div>
						</Card>
					</AnimatedSection>
				</div>
			</Container>
		</section>
	);
}

'use client';

import { Button } from '@barely/ui/button';
import { H, Text } from '@barely/ui/typography';

import { AnimatedSection } from '../shared/animated-section';
import { Container } from '../shared/container';

export function Hero() {
	const scrollToDemo = () => {
		const element = document.getElementById('how-it-works');
		element?.scrollIntoView({ behavior: 'smooth' });
	};

	return (
		<section className='relative min-h-[90vh] overflow-hidden pb-20 pt-32'>
			{/* Background gradient */}
			<div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5' />

			<Container className='relative'>
				<div className='mx-auto max-w-4xl text-center'>
					{/* Badge */}
					<AnimatedSection animation='fade-up'>
						<div className='mb-6 inline-flex items-center rounded-full bg-muted px-4 py-1.5 text-sm'>
							<span className='text-muted-foreground'>
								✨ New from the makers of Barely.io
							</span>
						</div>
					</AnimatedSection>

					{/* Headline */}
					<AnimatedSection animation='fade-up' delay={100}>
						<H size='1' className='mb-6 text-5xl font-bold tracking-tight md:text-7xl'>
							Get Paid in Days,
							<br />
							Not Weeks
						</H>
					</AnimatedSection>

					{/* Subheadline */}
					<AnimatedSection animation='fade-up' delay={200}>
						<Text
							variant='xl/normal'
							className='mx-auto mb-10 max-w-2xl text-muted-foreground'
						>
							Dead-simple invoicing that takes 60 seconds to send and gets you paid 3x
							faster. Set up recurring payments with one click. So simple it's barely
							software.
						</Text>
					</AnimatedSection>

					{/* CTA Buttons */}
					<AnimatedSection animation='fade-up' delay={300}>
						<div className='flex flex-col justify-center gap-4 sm:flex-row'>
							<Button size='lg' href='#waitlist' className='min-w-[200px]'>
								Start Free - No Card Required
							</Button>
							<Button
								size='lg'
								look='outline'
								onClick={scrollToDemo}
								className='min-w-[200px]'
							>
								See 60-Second Demo ↓
							</Button>
						</div>
					</AnimatedSection>

					{/* Trust Line */}
					<AnimatedSection animation='fade-up' delay={400}>
						<div className='mt-8 flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground sm:flex-row'>
							<span>⚡ Free forever for 3 invoices/month</span>
							<span className='hidden sm:inline'>•</span>
							<span>🔒 Powered by Stripe</span>
						</div>
					</AnimatedSection>
				</div>
			</Container>
		</section>
	);
}

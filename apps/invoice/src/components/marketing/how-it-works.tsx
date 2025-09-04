import { Card } from '@barely/ui/card';
import { H, Text } from '@barely/ui/typography';

import { AnimatedSection } from '../shared/animated-section';
import { Container } from '../shared/container';

export function HowItWorks() {
	const steps = [
		{
			number: '1',
			title: 'Create Your Invoice',
			description: "Type client name, add amount, hit send. That's literally it.",
			timing: 'Under 60 seconds',
		},
		{
			number: '2',
			title: 'Client Gets Clean Invoice',
			description: 'Professional invoice with a big "Pay Now" button. No account needed.',
			timing: 'Delivered instantly',
		},
		{
			number: '3',
			title: 'Money Hits Your Stripe',
			description: 'Direct deposit to your account. No middleman, no delays.',
			timing: 'Your usual Stripe timing',
		},
	];

	return (
		<section id='how-it-works' className='bg-muted/30 py-24'>
			<Container>
				<AnimatedSection animation='fade-up' className='mb-12 text-center'>
					<H size='2' className='mb-4'>
						Three Steps to Getting Paid
					</H>
				</AnimatedSection>

				<div className='grid gap-8 md:grid-cols-3'>
					{steps.map((step, index) => (
						<AnimatedSection
							key={step.number}
							animation='fade-up'
							delay={100 * (index + 1)}
						>
							<Card className='relative h-full p-6'>
								<div className='absolute -left-4 -top-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground'>
									{step.number}
								</div>
								<H size='4' className='mb-3 mt-4'>
									{step.title}
								</H>
								<Text variant='sm/normal' className='mb-4 text-muted-foreground'>
									{step.description}
								</Text>
								<div className='inline-flex items-center gap-1 text-sm text-primary'>
									<span className='font-medium'>[{step.timing}]</span>
								</div>
							</Card>
						</AnimatedSection>
					))}
				</div>
			</Container>
		</section>
	);
}

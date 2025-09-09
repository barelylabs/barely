import { Card } from '@barely/ui/card';
import { H, Text } from '@barely/ui/typography';

import { AnimatedSection } from '../shared/animated-section';
import { Container } from '../shared/container';

export function ProblemStatement() {
	const problems = [
		{
			title: 'Too Many Steps',
			description:
				'QuickBooks requires 47 clicks to create an invoice. FreshBooks needs 23. You just want to tell someone what they owe you.',
		},
		{
			title: 'Chasing Payments',
			description:
				'"Did you get my invoice?" "Just following up..." "Checking in again..." Sound familiar? You\'re a creator, not a collections agent.',
		},
		{
			title: 'Zero Recurring Revenue',
			description:
				'Invoice. Wait. Get paid. Chase. Repeat. Every month starts at $0. No predictability, constant income anxiety.',
		},
	];

	return (
		<section className='bg-muted/30 py-24'>
			<Container>
				<AnimatedSection animation='fade-up' className='mb-12 text-center'>
					<H size='2' className='mb-4'>
						You're Not an Accountant. Stop Using Accountant Software.
					</H>
				</AnimatedSection>

				<div className='grid gap-8 md:grid-cols-3'>
					{problems.map((problem, index) => (
						<AnimatedSection
							key={problem.title}
							animation='fade-up'
							delay={100 * (index + 1)}
						>
							<Card className='h-full p-6'>
								<H size='4' className='mb-3'>
									{problem.title}
								</H>
								<Text variant='sm/normal' className='text-muted-foreground'>
									{problem.description}
								</Text>
							</Card>
						</AnimatedSection>
					))}
				</div>
			</Container>
		</section>
	);
}

import { Button } from '@barely/ui/button';
import { Card } from '@barely/ui/card';
import { H, Text } from '@barely/ui/typography';

import { AnimatedSection } from '../shared/animated-section';
import { Container } from '../shared/container';

export function FinalCTA() {
	return (
		<section className='py-24'>
			<Container>
				<AnimatedSection animation='fade-up'>
					<Card className='mx-auto max-w-3xl border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10 p-12 text-center'>
						<H size='2' className='mb-4'>
							Your Next Invoice Could Be Your Fastest
						</H>

						<Text
							variant='lg/normal'
							className='mx-auto mb-8 max-w-2xl text-muted-foreground'
						>
							Join hundreds of freelancers who've simplified their billing. Free forever
							for 3 invoices per month. No credit card required.
						</Text>

						<div className='mb-6 flex items-center justify-center'>
							<Button size='lg' look='brand' href='#waitlist'>
								Create Your First Invoice Free →
							</Button>
						</div>

						<div className='flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground sm:flex-row'>
							<span>Takes 30 seconds to sign up</span>
							<span className='hidden sm:inline'>•</span>
							<span>Cancel anytime</span>
							<span className='hidden sm:inline'>•</span>
							<span>Your data is always yours</span>
						</div>
					</Card>
				</AnimatedSection>
			</Container>
		</section>
	);
}

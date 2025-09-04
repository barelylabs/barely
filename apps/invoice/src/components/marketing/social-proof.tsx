'use client';

import { useState } from 'react';
import { useZodForm } from '@barely/hooks';
import { z } from 'zod/v4';

import { Button } from '@barely/ui/button';
import { Card } from '@barely/ui/card';
import { Form } from '@barely/ui/forms/form';
import { TextField } from '@barely/ui/forms/text-field';
import { H, Text } from '@barely/ui/typography';

import { AnimatedSection } from '../shared/animated-section';
import { Container } from '../shared/container';

const waitlistSchema = z.object({
	email: z.string().email('Please enter a valid email'),
});

type WaitlistData = z.infer<typeof waitlistSchema>;

export function SocialProof() {
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const form = useZodForm({
		schema: waitlistSchema,
		defaultValues: {
			email: '',
		},
	});

	const handleSubmit = async (data: WaitlistData) => {
		setIsLoading(true);
		try {
			const response = await fetch('/api/waitlist', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email: data.email }),
			});

			if (!response.ok) {
				throw new Error('Failed to submit to waitlist');
			}

			setIsSubmitted(true);
		} catch (error) {
			console.error('Error submitting to waitlist:', error);
			// In production, show an error message to the user
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<section id='waitlist' className='py-24'>
			<Container>
				<AnimatedSection animation='fade-up' className='mb-12 text-center'>
					<H size='2' className='mb-4'>
						Built for Freelancers, By Freelancers
					</H>
				</AnimatedSection>

				<AnimatedSection animation='fade-up' delay={100}>
					<Card className='mx-auto max-w-2xl p-8'>
						<div className='mb-8 text-center'>
							<div className='mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary'>
								<span className='text-sm font-medium'>🚀 Launching January 2025</span>
							</div>

							<Text variant='sm/normal' className='mb-6 text-muted-foreground'>
								We're putting the final touches on Barely Invoice. We've been using it for
								our own agency billing for 3 months and can't wait to share it with you.
							</Text>

							<Text variant='sm/semibold' className='mb-8 text-primary'>
								Be one of the first 100 users and lock in Pro features for $5/month
								forever.
							</Text>
						</div>

						{!isSubmitted ?
							<Form form={form} onSubmit={handleSubmit}>
								<div className='flex flex-col gap-4 sm:flex-row'>
									<div className='flex-1'>
										<TextField
											control={form.control}
											name='email'
											type='email'
											placeholder='Enter your email'
											className='w-full'
										/>
									</div>
									<Button type='submit' loading={isLoading} className='sm:w-auto'>
										Join the Waitlist
									</Button>
								</div>
							</Form>
						:	<div className='text-center'>
								<div className='mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
									<span className='text-2xl'>🎉</span>
								</div>
								<H size='4' className='mb-2'>
									You're on the list!
								</H>
								<Text variant='sm/normal' className='text-muted-foreground'>
									We'll email you as soon as we launch with your exclusive discount.
								</Text>
							</div>
						}
					</Card>
				</AnimatedSection>

				{/* Our Story */}
				<AnimatedSection animation='fade-up' delay={200}>
					<div className='mx-auto mt-16 max-w-3xl text-center'>
						<Card className='bg-muted/30 p-8'>
							<Text variant='sm/normal' className='italic text-muted-foreground'>
								"We built Barely Invoice because we were tired of spending more time
								billing clients than doing the work they hired us for. After trying every
								invoicing tool out there, we realized they're all built for accountants,
								not creators. So we built our own."
							</Text>
							<Text variant='sm/semibold' className='mt-4'>
								- The Barely Team
							</Text>
						</Card>
					</div>
				</AnimatedSection>
			</Container>
		</section>
	);
}

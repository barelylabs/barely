'use client';

import type { PlaylistQualifier } from '@barely/validators';
import type { Metadata } from 'next';
import { useState } from 'react';
import Link from 'next/link';
import { useZodForm } from '@barely/hooks';
import { playlistQualifierSchema } from '@barely/validators';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { SelectField } from '@barely/ui/forms/select-field';
import { TextAreaField } from '@barely/ui/forms/text-area-field';
import { TextField } from '@barely/ui/forms/text-field';
import { Icon } from '@barely/ui/icon';
import { H } from '@barely/ui/typography';

import { AnimatedSection } from '../../../components/marketing/animated-section';
import { MarketingButton } from '../../../components/marketing/button';
import { SecurityBadge } from '../../../components/marketing/trust-badges';

export default function QualifierPage() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const form = useZodForm<PlaylistQualifier, PlaylistQualifier>({
		schema: playlistQualifierSchema,
		defaultValues: {
			artistName: '',
			email: '',
			spotifyTrackUrl: '',
			instagramHandle: '',
			budgetRange: '<$500/mo',
			goals: '',
		},
	});

	const handleSubmit = async (data: PlaylistQualifier) => {
		setIsSubmitting(true);
		setSubmitError(null);

		try {
			const response = await fetch('/api/playlist-qualifier', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || 'Failed to submit');
			}

			setSubmitSuccess(true);
			setTimeout(() => {
				setSubmitSuccess(false);
				form.reset();
			}, 5000);
		} catch (error) {
			console.error('Form submission error:', error);
			setSubmitError(error instanceof Error ? error.message : 'Failed to submit');
		} finally {
			setIsSubmitting(false);
		}
	};

	const budgetOptions = [
		{ value: '<$500/mo' as const, label: 'Less than $500/month' },
		{ value: '$500-1k' as const, label: '$500-1k/month' },
		{ value: '$1k-2.5k' as const, label: '$1k-2.5k/month' },
		{ value: '$2.5k+' as const, label: '$2.5k+/month' },
		{ value: 'Not sure yet' as const, label: "Not sure yet (let's discuss)" },
	];

	return (
		<main className='pt-16'>
			{/* Page Header */}
			<section className='px-4 py-16 sm:px-6 sm:py-24 lg:px-8'>
				<div className='mx-auto max-w-2xl text-center'>
					<AnimatedSection animation='fade-up'>
						<H size='1' className='mb-4 font-heading text-4xl md:text-5xl lg:text-6xl'>
							Let's Grow Your Music
						</H>
						<p className='text-lg text-white/70 md:text-xl'>
							Tell us about your goals and we'll create a custom growth plan
						</p>
						<p className='mt-4 text-sm text-white/60'>
							Free consultation • No obligation • Honest timeline
						</p>
					</AnimatedSection>
				</div>
			</section>

			{/* Form Section */}
			<section className='px-4 pb-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-xl'>
					<AnimatedSection animation='fade-up' delay={200}>
						<div className='glass rounded-xl p-6 sm:p-8'>
							{submitSuccess ?
								<div className='py-8 text-center'>
									<div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20'>
										<Icon.check className='h-8 w-8 text-green-500' />
									</div>
									<H size='3' className='mb-2 text-2xl'>
										We'll Be In Touch!
									</H>
									<p className='mb-4 text-white/60'>
										Thanks for your interest. We'll review your info and email you within
										24 hours to schedule a free consultation.
									</p>
									<Link href='/case-studies'>
										<MarketingButton marketingLook='scientific' size='lg'>
											Read Case Studies While You Wait
										</MarketingButton>
									</Link>
								</div>
							:	<>
									<div className='mb-8'>
										<H size='3' className='mb-2 text-2xl'>
											Growth Qualifier
										</H>
										<p className='text-sm text-white/60'>
											Help us understand your needs • Takes ~3 minutes
										</p>
									</div>

									<Form
										form={form}
										onSubmit={handleSubmit}
										className='space-y-5'
										noValidate
									>
										<TextField
											control={form.control}
											name='artistName'
											label='Artist / Band Name *'
											placeholder='Your artist name'
											className='border-white/10 bg-white/5 text-white placeholder:text-white/40'
										/>

										<TextField
											control={form.control}
											name='email'
											type='email'
											label='Email *'
											placeholder='artist@example.com'
											className='border-white/10 bg-white/5 text-white placeholder:text-white/40'
										/>

										<TextField
											control={form.control}
											name='spotifyTrackUrl'
											label='Spotify Track URL *'
											placeholder='https://open.spotify.com/track/...'
											className='border-white/10 bg-white/5 text-white placeholder:text-white/40'
										/>

										<TextField
											control={form.control}
											name='instagramHandle'
											label='Instagram Handle *'
											placeholder='@yourartistname'
											className='border-white/10 bg-white/5 text-white placeholder:text-white/40'
										/>

										<SelectField
											control={form.control}
											name='budgetRange'
											label='Monthly Marketing Budget *'
											options={budgetOptions}
											className='border-white/10 bg-white/5 text-white'
										/>

										<TextAreaField
											control={form.control}
											name='goals'
											label='What are your biggest music marketing goals? *'
											placeholder="e.g., 'Grow from 1k to 10k monthly listeners in 6 months' or 'Generate consistent merch revenue through targeted campaigns'"
											rows={4}
											className='resize-none border-white/10 bg-white/5 text-white placeholder:text-white/40'
										/>

										{submitError && (
											<div className='rounded-md border border-red-500/20 bg-red-500/10 p-3'>
												<p className='text-sm text-red-500'>{submitError}</p>
											</div>
										)}

										<div className='flex justify-center pt-2'>
											<SecurityBadge />
										</div>

										<div className='pt-4'>
											<SubmitButton
												fullWidth
												loading={isSubmitting}
												loadingText='Sending...'
												className='bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
											>
												Get Free Consultation
											</SubmitButton>
										</div>
									</Form>

									<div className='mt-8 border-t border-white/10 pt-8'>
										<div className='mb-6 text-center'>
											<H size='4' className='mb-4 text-lg'>
												What Happens Next?
											</H>
											<div className='space-y-3 text-left text-sm text-white/60'>
												<div className='flex gap-3'>
													<div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400'>
														1
													</div>
													<p>
														<strong className='text-white'>We review your info</strong>{' '}
														and check out your current metrics
													</p>
												</div>
												<div className='flex gap-3'>
													<div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400'>
														2
													</div>
													<p>
														<strong className='text-white'>Free 15-min call</strong> to
														understand your goals and challenges
													</p>
												</div>
												<div className='flex gap-3'>
													<div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400'>
														3
													</div>
													<p>
														<strong className='text-white'>Custom growth plan</strong>{' '}
														with realistic timeline and budget breakdown
													</p>
												</div>
											</div>
										</div>

										<div className='rounded-lg border border-white/10 bg-white/5 p-4 text-center'>
											<p className='mb-2 text-sm font-semibold text-white'>
												Not ready yet?
											</p>
											<p className='text-xs text-white/50'>
												No worries. You can always come back when you're ready to scale.
											</p>
										</div>
									</div>
								</>
							}
						</div>
					</AnimatedSection>
				</div>
			</section>
		</main>
	);
}

'use client';

import { useState } from 'react';
import type { Metadata } from 'next';
import { useRouter } from 'next/navigation';
import { useZodForm } from '@barely/hooks';
import { playlistSubmissionSchema } from '@barely/validators';
import type { PlaylistSubmission } from '@barely/validators';

import { Form, SubmitButton } from '@barely/ui/forms/form';
import { TextField } from '@barely/ui/forms/text-field';
import { H } from '@barely/ui/typography';

import { AnimatedSection } from '../../components/marketing/animated-section';
import { MarketingButton } from '../../components/marketing/button';
import { SecurityBadge } from '../../components/marketing/trust-badges';

export default function SubmitToBarelyIndiePage() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const form = useZodForm<PlaylistSubmission, PlaylistSubmission>({
		schema: playlistSubmissionSchema,
		defaultValues: {
			artistName: '',
			email: '',
			spotifyTrackUrl: '',
			instagramHandle: '',
		},
	});

	const handleSubmit = async (data: PlaylistSubmission) => {
		setIsSubmitting(true);
		setSubmitError(null);

		try {
			const response = await fetch('/api/playlist-submission', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || 'Failed to submit');
			}

			// Redirect to thank you page on success
			router.push('/submit-to-barely-indie/thank-you');
		} catch (error) {
			console.error('Form submission error:', error);
			setSubmitError(error instanceof Error ? error.message : 'Failed to submit');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<main className='pt-16'>
			{/* Page Header */}
			<section className='px-4 py-16 sm:px-6 sm:py-24 lg:px-8'>
				<div className='mx-auto max-w-2xl text-center'>
					<AnimatedSection animation='fade-up'>
						<H size='1' className='mb-4 font-heading text-4xl md:text-5xl lg:text-6xl'>
							Submit to @barely.indie
						</H>
						<p className='text-lg text-white/70 md:text-xl'>
							Get your track on our curated Brooklyn-based indie playlist
						</p>
						<p className='mt-4 text-sm text-white/60'>
							5-10k monthly listeners • ~300 tracks curated
						</p>
					</AnimatedSection>
				</div>
			</section>

			{/* Form Section */}
			<section className='px-4 pb-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-xl'>
					<AnimatedSection animation='fade-up' delay={200}>
						<div className='glass rounded-xl p-6 sm:p-8'>
							<div className='mb-8'>
								<H size='3' className='mb-2 text-2xl'>
									Submission Form
								</H>
								<p className='text-sm text-white/60'>
									Takes less than 2 minutes • All submissions reviewed
								</p>
							</div>

							<Form form={form} onSubmit={handleSubmit} className='space-y-5' noValidate>
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
										loadingText='Submitting...'
										className='bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
									>
										Submit Track
									</SubmitButton>
								</div>
							</Form>

							<div className='mt-8 border-t border-white/10 pt-8'>
								<div className='mb-6 text-center'>
									<H size='4' className='mb-2 text-lg'>
										What to Expect
									</H>
									<div className='space-y-2 text-sm text-white/60'>
										<p>✓ All submissions reviewed within 1-2 weeks</p>
										<p>✓ Email confirmation sent immediately</p>
										<p>✓ Acceptance rate: ~15-20%</p>
									</div>
								</div>

								<div className='text-center'>
									<p className='mb-4 text-sm text-white/70'>
										Want help growing your audience?
									</p>
									<p className='text-xs text-white/50'>
										You'll see service options after submitting →
									</p>
								</div>
							</div>
						</div>
					</AnimatedSection>
				</div>
			</section>
		</main>
	);
}

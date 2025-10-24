'use client';

import { useState } from 'react';
import { useZodForm } from '@barely/hooks';
import { z } from 'zod/v4';

import { CheckboxField } from '@barely/ui/forms/checkbox-field';
import { Form, SubmitButton } from '@barely/ui/forms/form';
import { SelectField } from '@barely/ui/forms/select-field';
import { TextAreaField } from '@barely/ui/forms/text-area-field';
import { TextField } from '@barely/ui/forms/text-field';
import { H } from '@barely/ui/typography';

import { AnimatedSection } from '~/components/marketing/animated-section';

const testimonialFormSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	bandName: z.string().min(1, 'Band/Artist name is required'),
	tier: z.enum(['bedroom', 'rising', 'breakout'], 'Please select your current tier'),
	duration: z.enum(
		['less-3', '3-6', '6-12', '12-plus'],
		"Please select how long you've been with Barely",
	),
	testimonial: z
		.string()
		.min(50, 'Please provide at least 50 characters')
		.max(1000, 'Please keep your testimonial under 1000 characters'),
	consent: z
		.boolean()
		.refine(val => val === true, 'You must give consent to share your testimonial'),
});

type TestimonialFormData = z.infer<typeof testimonialFormSchema>;

export default function TestimonialsPage() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const form = useZodForm({
		schema: testimonialFormSchema,
		defaultValues: {
			name: '',
			bandName: '',
			tier: undefined,
			duration: undefined,
			testimonial: '',
			consent: false,
		},
	});

	// Watch the duration field to show/hide $100 credit notice
	const duration = form.watch('duration');
	const showCreditNotice = duration === '6-12' || duration === '12-plus';

	const handleSubmit = async (data: TestimonialFormData) => {
		setIsSubmitting(true);
		setSubmitError(null);

		try {
			const response = await fetch('/api/testimonials', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || 'Failed to submit testimonial');
			}

			setSubmitSuccess(true);
			form.reset();

			// Scroll to top to show success message
			window.scrollTo({ top: 0, behavior: 'smooth' });
		} catch (error) {
			console.error('Form submission error:', error);
			setSubmitError(
				error instanceof Error ? error.message : 'Failed to submit testimonial',
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (submitSuccess) {
		return (
			<main className='pt-16'>
				<section className='px-4 py-24 sm:px-6 lg:px-8'>
					<div className='mx-auto max-w-2xl text-center'>
						<AnimatedSection animation='scale'>
							<div className='glass rounded-xl p-12'>
								<div className='mb-6'>
									<div className='mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-pink-600'>
										<span className='text-4xl'>✨</span>
									</div>
								</div>
								<H size='2' className='mb-4'>
									Thank You for Sharing Your Story!
								</H>
								<p className='mb-8 text-lg text-white/70'>
									We&apos;ll review it and be in touch soon.
								</p>
								<button
									onClick={() => setSubmitSuccess(false)}
									className='text-purple-400 hover:text-purple-300'
								>
									Submit another testimonial →
								</button>
							</div>
						</AnimatedSection>
					</div>
				</section>
			</main>
		);
	}

	return (
		<main className='pt-16'>
			{/* Hero Section */}
			<section className='px-4 py-24 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-4xl text-center'>
					<AnimatedSection animation='fade-up'>
						<H size='1' className='mb-6 font-heading text-5xl md:text-6xl lg:text-7xl'>
							Share Your Story
						</H>
						<p className='text-xl text-white/70 md:text-2xl'>
							Help other artists see what&apos;s possible with transparent, data-driven
							marketing
						</p>
					</AnimatedSection>
				</div>
			</section>

			{/* Why It Matters */}
			<section className='px-4 pb-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-3xl text-center'>
					<AnimatedSection animation='fade-up'>
						<p className='text-lg text-white/70'>
							Your experience helps other independent artists trust the process and take
							the leap. Sharing what worked for you makes a real difference.
						</p>
					</AnimatedSection>
				</div>
			</section>

			{/* Testimonial Form */}
			<section className='px-4 py-12 sm:px-6 lg:px-8'>
				<div className='mx-auto max-w-2xl'>
					<AnimatedSection animation='fade-up' delay={200}>
						<div className='glass rounded-xl p-8'>
							<Form form={form} onSubmit={handleSubmit}>
								<div className='space-y-6'>
									<TextField
										control={form.control}
										name='name'
										label='Your Name'
										placeholder='John Doe'
									/>

									<TextField
										control={form.control}
										name='bandName'
										label='Band/Artist Name'
										placeholder='The Example Band'
									/>

									<SelectField
										control={form.control}
										name='tier'
										label='Current Tier'
										options={[
											{ value: 'bedroom', label: 'Bedroom+' },
											{ value: 'rising', label: 'Rising+' },
											{ value: 'breakout', label: 'Breakout+' },
										]}
										placeholder='Select your tier'
									/>

									<SelectField
										control={form.control}
										name='duration'
										label='How long with Barely?'
										options={[
											{ value: 'less-3', label: 'Less than 3 months' },
											{ value: '3-6', label: '3-6 months' },
											{ value: '6-12', label: '6-12 months' },
											{ value: '12-plus', label: '12+ months' },
										]}
										placeholder='Select duration'
									/>

									{showCreditNotice && (
										<div className='rounded-lg bg-gradient-to-r from-violet-600/20 to-pink-600/20 p-4'>
											<div className='flex items-start gap-3'>
												<span className='text-2xl'>🎉</span>
												<div>
													<div className='font-semibold text-purple-300'>
														$100 Credit Available
													</div>
													<p className='text-sm text-white/70'>
														As a thank you for clients who have been with us 6+ months,
														we&apos;ll credit your next invoice $100
													</p>
												</div>
											</div>
										</div>
									)}

									<div>
										<TextAreaField
											control={form.control}
											name='testimonial'
											label='Your Testimonial'
											placeholder='What were you struggling with before? What results have you seen? What surprised you most?'
											rows={8}
										/>
										<p className='mt-1 text-sm text-white/60'>
											150-300 words recommended
										</p>
									</div>

									<CheckboxField
										control={form.control}
										name='consent'
										label='I give Barely NYC permission to use this testimonial publicly on the website, social media, and marketing materials'
									/>

									{submitError && (
										<div className='rounded-lg bg-red-500/10 p-4 text-red-400'>
											{submitError}
										</div>
									)}

									<SubmitButton loading={isSubmitting} fullWidth>
										Share My Story
									</SubmitButton>
								</div>
							</Form>
						</div>
					</AnimatedSection>
				</div>
			</section>
		</main>
	);
}

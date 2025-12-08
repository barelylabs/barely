'use client';

import { useState } from 'react';
import { useZodForm } from '@barely/hooks';
import { z } from 'zod/v4';

import { Button } from '@barely/ui/button';
import { Form } from '@barely/ui/forms/form';
import { SelectField } from '@barely/ui/forms/select-field';
import { TextAreaField } from '@barely/ui/forms/text-area-field';
import { TextField } from '@barely/ui/forms/text-field';
import { Icon } from '@barely/ui/icon';
import { Modal, ModalBody, ModalHeader } from '@barely/ui/modal';

import { useCalComUrl } from '../../hooks/use-cal-com-url';
import { MarketingButton } from './button';
import { SecurityBadge } from './trust-badges';

interface ContactModalProps {
	showModal: boolean;
	setShowModal: (show: boolean) => void;
	preSelectedService?: 'bedroom' | 'rising' | 'breakout';
	prefillData?: {
		name?: string;
		email?: string;
		artistName?: string;
		monthlyListeners?: string;
		instagramHandle?: string;
		spotifyTrackUrl?: string;
		budgetRange?: '<$500/mo' | '$500-1k' | '$1k-2.5k' | '$2.5k+' | 'Not sure yet';
	};
}

const contactFormSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.email('Invalid email address'),
	artistName: z.string().optional(),
	monthlyListeners: z.string().optional(),
	service: z.enum(['bedroom', 'rising', 'breakout', '']).optional(),
	message: z.string().min(10, 'Message must be at least 10 characters'),
	// Additional fields from Growth Qualifier
	spotifyTrackUrl: z.string().optional(),
	instagramHandle: z.string().optional(),
	budgetRange: z
		.enum(['<$500/mo', '$500-1k', '$1k-2.5k', '$2.5k+', 'Not sure yet'])
		.optional(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export function ContactModal({
	showModal,
	setShowModal,
	preSelectedService,
	prefillData,
}: ContactModalProps) {
	const calComUrl = useCalComUrl();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const form = useZodForm<ContactFormData, ContactFormData>({
		schema: contactFormSchema,
		values: {
			name: prefillData?.name ?? '',
			email: prefillData?.email ?? '',
			artistName: prefillData?.artistName ?? '',
			monthlyListeners: prefillData?.monthlyListeners ?? '',
			service: preSelectedService ?? '',
			message: '',
			spotifyTrackUrl: prefillData?.spotifyTrackUrl ?? '',
			instagramHandle: prefillData?.instagramHandle ?? '',
			budgetRange: prefillData?.budgetRange,
		},
		resetOptions: { keepDirtyValues: true },
	});

	const handleSubmit = async (data: ContactFormData) => {
		setIsSubmitting(true);
		setSubmitError(null);

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || 'Failed to send message');
			}

			setSubmitSuccess(true);
			setTimeout(() => {
				setShowModal(false);
				setSubmitSuccess(false);
				form.reset();
			}, 2000);
		} catch (error) {
			console.error('Form submission error:', error);
			setSubmitError(error instanceof Error ? error.message : 'Failed to send message');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Modal
			showModal={showModal}
			setShowModal={setShowModal}
			className='max-w-lg border-white/10 bg-[#0A0A0B]'
		>
			<ModalHeader
				title={submitSuccess ? 'Message Sent!' : "Let's Grow Your Music"}
				subtitle={submitSuccess ? '' : "I'll respond within 24 hours"}
				justify='left'
			/>

			<ModalBody className='bg-[#0A0A0B]'>
				{submitSuccess ?
					<div className='py-8 text-center'>
						<div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20'>
							<Icon.check className='h-8 w-8 text-green-500' />
						</div>
						<p className='mb-2 text-xl font-semibold text-white'>Message Sent!</p>
						<p className='text-white/60'>I&apos;ll get back to you within 24 hours.</p>
					</div>
				:	<>
						<Form form={form} onSubmit={handleSubmit} className='space-y-4' noValidate>
							<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
								<TextField
									control={form.control}
									name='name'
									label='Your Name *'
									placeholder='John Doe'
									className='border-white/10 bg-white/5 text-white placeholder:text-white/40'
								/>

								<TextField
									control={form.control}
									name='email'
									type='email'
									label='Email *'
									placeholder='john@example.com'
									className='border-white/10 bg-white/5 text-white placeholder:text-white/40'
								/>
							</div>

							<details className='group'>
								<summary className='mb-4 cursor-pointer text-sm text-white/60 hover:text-white/80'>
									+ Add more details (optional)
								</summary>
								<div className='space-y-4'>
									<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
										<TextField
											control={form.control}
											name='artistName'
											label='Artist/Band Name'
											placeholder='Your artist name'
											className='border-white/10 bg-white/5 text-white placeholder:text-white/40'
										/>

										<TextField
											control={form.control}
											name='monthlyListeners'
											label='Monthly Listeners'
											placeholder='e.g., 5000'
											className='border-white/10 bg-white/5 text-white placeholder:text-white/40'
										/>
									</div>

									<TextField
										control={form.control}
										name='spotifyTrackUrl'
										label='Spotify Track URL'
										placeholder='https://open.spotify.com/track/...'
										className='border-white/10 bg-white/5 text-white placeholder:text-white/40'
									/>

									<TextField
										control={form.control}
										name='instagramHandle'
										label='Instagram Handle'
										placeholder='@yourartistname'
										className='border-white/10 bg-white/5 text-white placeholder:text-white/40'
									/>

									<SelectField
										control={form.control}
										name='budgetRange'
										label='Monthly Marketing Budget'
										options={[
											{ value: '<$500/mo', label: 'Less than $500/month' },
											{ value: '$500-1k', label: '$500-1k/month' },
											{ value: '$1k-2.5k', label: '$1k-2.5k/month' },
											{ value: '$2.5k+', label: '$2.5k+/month' },
											{ value: 'Not sure yet', label: "Not sure yet (let's discuss)" },
										]}
										className='border-white/10 bg-white/5 text-white'
									/>
								</div>
							</details>

							<TextAreaField
								control={form.control}
								name='message'
								label="What's your biggest music marketing challenge? *"
								placeholder="e.g., 'I need help growing from 1k to 10k monthly listeners' or 'Looking to launch my new album effectively'"
								rows={4}
								className='resize-none border-white/10 bg-white/5 text-white placeholder:text-white/40'
							/>

							{submitError && (
								<div className='rounded-md border border-red-500/20 bg-red-500/10 p-3'>
									<p className='text-sm text-red-500'>{submitError}</p>
								</div>
							)}

							<div className='flex justify-center'>
								<SecurityBadge />
							</div>

							<div className='flex gap-3 pt-4'>
								<MarketingButton
									type='submit'
									marketingLook='hero-primary'
									fullWidth
									loading={isSubmitting}
									loadingText='Sending...'
								>
									Send Message
								</MarketingButton>
								<Button
									type='button'
									look='outline'
									onClick={e => {
										e.preventDefault();
										e.stopPropagation();
										setShowModal(false);
									}}
									className='border-white/20 text-white hover:bg-white/10'
								>
									Cancel
								</Button>
							</div>
						</Form>

						<div className='mt-6 border-t border-white/10 pt-6'>
							<p className='mb-4 text-center text-white/70'>
								Or book a free strategy call:
							</p>
							<a
								href={calComUrl}
								target='_blank'
								rel='noopener noreferrer'
								className='block'
							>
								<MarketingButton
									marketingLook='scientific'
									fullWidth
									className='flex items-center justify-center gap-2'
								>
									<Icon.calendar className='h-4 w-4' />
									Book Free 30-Min Strategy Call
								</MarketingButton>
							</a>
							<p className='mt-2 text-center text-xs text-white/60'>
								Get your custom strategy kick-off plan
							</p>
						</div>

						<p className='mt-4 text-center text-xs text-white/50'>
							Or email directly: hello@barely.nyc
						</p>
					</>
				}
			</ModalBody>
		</Modal>
	);
}

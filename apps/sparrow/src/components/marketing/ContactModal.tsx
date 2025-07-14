'use client';

import { useState } from 'react';
import { useZodForm } from '@barely/hooks';
import { cn } from '@barely/utils';
import { z } from 'zod/v4';

import { Button } from '@barely/ui/button';
import { Icon } from '@barely/ui/icon';
import { Input } from '@barely/ui/input';
import { Modal, ModalBody, ModalHeader } from '@barely/ui/modal';
import { Textarea } from '@barely/ui/textarea';

import { MarketingButton } from './Button';

interface ContactModalProps {
	showModal: boolean;
	setShowModal: (show: boolean) => void;
	preSelectedService?: 'bedroom' | 'rising' | 'breakout';
}

const contactFormSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.string().email('Invalid email address'),
	artistName: z.string().optional(),
	monthlyListeners: z.string().optional(),
	service: z.enum(['bedroom', 'rising', 'breakout', '']).optional(),
	message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export function ContactModal({
	showModal,
	setShowModal,
	preSelectedService,
}: ContactModalProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const form = useZodForm<ContactFormData, ContactFormData>({
		schema: contactFormSchema,
		defaultValues: {
			name: '',
			email: '',
			artistName: '',
			monthlyListeners: '',
			service: preSelectedService ?? '',
			message: '',
		},
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
				title="Let's Talk About Your Music"
				subtitle={submitSuccess ? '' : 'Tell me about your project and goals'}
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
						<form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
							<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
								<div>
									<label
										htmlFor='name'
										className='mb-1 block text-sm font-medium text-white/70'
									>
										Your Name *
									</label>
									<Input
										id='name'
										{...form.register('name')}
										className='border-white/10 bg-white/5 text-white placeholder:text-white/40'
										placeholder='John Doe'
									/>
									{form.formState.errors.name && (
										<p className='mt-1 text-xs text-red-500'>
											{form.formState.errors.name.message}
										</p>
									)}
								</div>

								<div>
									<label
										htmlFor='email'
										className='mb-1 block text-sm font-medium text-white/70'
									>
										Email *
									</label>
									<Input
										id='email'
										type='email'
										{...form.register('email')}
										className='border-white/10 bg-white/5 text-white placeholder:text-white/40'
										placeholder='john@example.com'
									/>
									{form.formState.errors.email && (
										<p className='mt-1 text-xs text-red-500'>
											{form.formState.errors.email.message}
										</p>
									)}
								</div>
							</div>

							<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
								<div>
									<label
										htmlFor='artistName'
										className='mb-1 block text-sm font-medium text-white/70'
									>
										Artist/Band Name
									</label>
									<Input
										id='artistName'
										{...form.register('artistName')}
										className='border-white/10 bg-white/5 text-white placeholder:text-white/40'
										placeholder='Your artist name'
									/>
								</div>

								<div>
									<label
										htmlFor='monthlyListeners'
										className='mb-1 block text-sm font-medium text-white/70'
									>
										Monthly Listeners
									</label>
									<Input
										id='monthlyListeners'
										{...form.register('monthlyListeners')}
										className='border-white/10 bg-white/5 text-white placeholder:text-white/40'
										placeholder='e.g., 5000'
									/>
								</div>
							</div>

							<div>
								<label
									htmlFor='service'
									className='mb-1 block text-sm font-medium text-white/70'
								>
									Service Interest
								</label>
								<select
									id='service'
									{...form.register('service')}
									className={cn(
										'w-full rounded-md px-3 py-2',
										'border border-white/10 bg-white/5 text-white',
										'focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500',
									)}
								>
									<option value='' className='bg-[#0A0A0B]'>
										Select a service
									</option>
									<option value='bedroom' className='bg-[#0A0A0B]'>
										Bedroom+ ($200/month)
									</option>
									<option value='rising' className='bg-[#0A0A0B]'>
										Rising+ ($750/month)
									</option>
									<option value='breakout' className='bg-[#0A0A0B]'>
										Breakout+ ($1,800/month)
									</option>
								</select>
							</div>

							<div>
								<label
									htmlFor='message'
									className='mb-1 block text-sm font-medium text-white/70'
								>
									Tell me about your goals
								</label>
								<Textarea
									id='message'
									rows={4}
									{...form.register('message')}
									className='resize-none border-white/10 bg-white/5 text-white placeholder:text-white/40'
									placeholder="What are you hoping to achieve with your music? Any specific challenges you're facing?"
								/>
								{form.formState.errors.message && (
									<p className='mt-1 text-xs text-red-500'>
										{form.formState.errors.message.message}
									</p>
								)}
							</div>

							{submitError && (
								<div className='rounded-md border border-red-500/20 bg-red-500/10 p-3'>
									<p className='text-sm text-red-500'>{submitError}</p>
								</div>
							)}

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
									onClick={() => setShowModal(false)}
									className='border-white/20 text-white hover:bg-white/10'
								>
									Cancel
								</Button>
							</div>
						</form>

						<div className='mt-6 border-t border-white/10 pt-6'>
							<p className='mb-4 text-center text-white/70'>
								Or book a free strategy call:
							</p>
							<a
								href='https://app.usemotion.com/meet/barely/discovery'
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
									Book 15-Min Discovery Call
								</MarketingButton>
							</a>
						</div>

						<p className='mt-4 text-center text-xs text-white/50'>
							Or email directly: hello@barelysparrow.com
						</p>
					</>
				}
			</ModalBody>
		</Modal>
	);
}

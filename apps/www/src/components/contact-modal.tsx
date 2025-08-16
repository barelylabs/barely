'use client';

import { useState } from 'react';
import { useZodForm } from '@barely/hooks';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import { Button } from '@barely/ui/button';
import { Form, SubmitButton } from '@barely/ui/forms/form';
import { TextAreaField } from '@barely/ui/forms/text-area-field';
import { TextField } from '@barely/ui/forms/text-field';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';

// Define the contact form schema
const contactFormSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.email('Invalid email address'),
	artistName: z.string().optional(),
	message: z.string().min(10, 'Please provide more details about your needs'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactModalProps {
	show: boolean;
	onClose: () => void;
	variant?: 'demo' | 'support';
}

export function ContactModal({ show, onClose, variant = 'demo' }: ContactModalProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useZodForm({
		schema: contactFormSchema,
		defaultValues: {
			name: '',
			email: '',
			artistName: '',
			message: '',
		},
	});

	const handleSubmit = async (data: ContactFormData) => {
		setIsSubmitting(true);

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...data, variant }),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || 'Failed to send message');
			}

			if (variant === 'demo') {
				toast.success("Demo request sent! We'll be in touch within 24 hours.");
			} else {
				toast.success("Message sent! We'll get back to you soon.");
			}

			form.reset();
			onClose();
		} catch (error) {
			console.error('Form submission error:', error);
			if (error instanceof Error) {
				toast.error(error.message);
			} else {
				toast.error('Failed to send message');
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const title = variant === 'demo' ? 'Book a Demo' : 'Get in Touch';
	const description =
		variant === 'demo' ?
			"Let's show you how barely.ai can transform your music marketing workflow."
		:	"Have a question or need help? We're here for you.";

	return (
		<Modal showModal={show} setShowModal={onClose} className='sm:max-w-lg'>
			<ModalHeader icon='email' title={title} />
			<Form form={form} onSubmit={handleSubmit}>
				<ModalBody>
					<div className='space-y-4'>
						<p className='text-sm text-gray-400'>{description}</p>

						<TextField
							control={form.control}
							name='name'
							label='Name'
							placeholder='Your name'
						/>

						<TextField
							control={form.control}
							name='email'
							type='email'
							label='Email'
							placeholder='your@email.com'
						/>

						<TextField
							control={form.control}
							name='artistName'
							label='Artist/Label Name (Optional)'
							placeholder='Your artist or label name'
						/>

						<TextAreaField
							control={form.control}
							name='message'
							label='Message'
							placeholder={
								variant === 'demo' ?
									'Tell us about your music marketing needs and current challenges...'
								:	'How can we help you?'
							}
							rows={4}
						/>
					</div>
				</ModalBody>

				<ModalFooter>
					<div className='flex w-full justify-end gap-2'>
						<Button
							type='button'
							look='outline'
							onClick={onClose}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<SubmitButton loading={isSubmitting}>
							{variant === 'demo' ? 'Request Demo' : 'Send Message'}
						</SubmitButton>
					</div>
				</ModalFooter>
			</Form>
		</Modal>
	);
}

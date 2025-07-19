'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@barely/ui/button';
import { Input } from '@barely/ui/input';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@barely/ui/modal';
import { Textarea } from '@barely/ui/textarea';

interface ContactModalProps {
	show: boolean;
	onClose: () => void;
	variant?: 'demo' | 'support';
}

export function ContactModal({ show, onClose, variant = 'demo' }: ContactModalProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		artistName: '',
		message: '',
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = 'Name is required';
		}

		if (!formData.email.trim()) {
			newErrors.email = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = 'Invalid email address';
		}

		if (!formData.message.trim()) {
			newErrors.message = 'Message is required';
		} else if (formData.message.trim().length < 10) {
			newErrors.message = 'Please provide more details about your needs';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}
		setIsSubmitting(true);

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...formData, variant }),
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

			setFormData({ name: '', email: '', artistName: '', message: '' });
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

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
		// Clear error when user starts typing
		if (errors[name]) {
			setErrors(prev => ({ ...prev, [name]: '' }));
		}
	};

	const title = variant === 'demo' ? 'Book a Demo' : 'Get in Touch';
	const description =
		variant === 'demo' ?
			"Let's show you how barely.io can transform your music marketing workflow."
		:	"Have a question or need help? We're here for you.";

	return (
		<Modal showModal={show} setShowModal={onClose} className='sm:max-w-lg'>
			<ModalHeader icon='email' title={title} />
			<form onSubmit={handleSubmit}>
				<ModalBody>
					<div className='space-y-4'>
						<p className='text-sm text-gray-400'>{description}</p>

						<div>
							<label htmlFor='name' className='mb-1 block text-sm font-medium text-white'>
								Name
							</label>
							<Input
								id='name'
								name='name'
								value={formData.name}
								onChange={handleInputChange}
								placeholder='Your name'
								isError={!!errors.name}
							/>
							{errors.name && <p className='mt-1 text-xs text-red-500'>{errors.name}</p>}
						</div>

						<div>
							<label
								htmlFor='email'
								className='mb-1 block text-sm font-medium text-white'
							>
								Email
							</label>
							<Input
								id='email'
								name='email'
								type='email'
								value={formData.email}
								onChange={handleInputChange}
								placeholder='your@email.com'
								isError={!!errors.email}
							/>
							{errors.email && (
								<p className='mt-1 text-xs text-red-500'>{errors.email}</p>
							)}
						</div>

						<div>
							<label
								htmlFor='artistName'
								className='mb-1 block text-sm font-medium text-white'
							>
								Artist/Label Name (Optional)
							</label>
							<Input
								id='artistName'
								name='artistName'
								value={formData.artistName}
								onChange={handleInputChange}
								placeholder='Your artist or label name'
							/>
						</div>

						<div>
							<label
								htmlFor='message'
								className='mb-1 block text-sm font-medium text-white'
							>
								Message
							</label>
							<Textarea
								id='message'
								name='message'
								value={formData.message}
								onChange={handleInputChange}
								placeholder={
									variant === 'demo' ?
										'Tell us about your music marketing needs and current challenges...'
									:	'How can we help you?'
								}
								rows={4}
								isError={!!errors.message}
							/>
							{errors.message && (
								<p className='mt-1 text-xs text-red-500'>{errors.message}</p>
							)}
						</div>
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
						<Button type='submit' disabled={isSubmitting} loading={isSubmitting}>
							{variant === 'demo' ? 'Request Demo' : 'Send Message'}
						</Button>
					</div>
				</ModalFooter>
			</form>
		</Modal>
	);
}

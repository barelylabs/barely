'use client';

import { useState } from 'react';
import { useZodForm } from '@barely/hooks';
import { cn } from '@barely/utils';
import { z } from 'zod/v4';

import { CheckboxField } from '../forms/checkbox-field';
import { Form, SubmitButton } from '../forms/form';
import { TextField } from '../forms/text-field';
import { useBioContext } from './contexts/bio-context';
import { useBrandKit } from './contexts/brand-kit-context';

const emailCaptureSchema = z.object({
	email: z.email('Please enter a valid email address'),
	marketingConsent: z.boolean().default(false),
});

type EmailCaptureFormData = z.infer<typeof emailCaptureSchema>;

export function BioEmailCaptureRender() {
	const { bio, onEmailCapture, isPreview } = useBioContext();
	const brandKit = useBrandKit();

	const [isSubmitted, setIsSubmitted] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);

	const form = useZodForm({
		schema: emailCaptureSchema,
		defaultValues: {
			email: '',
			marketingConsent: false,
		},
	});

	const handleSubmit = async (data: EmailCaptureFormData) => {
		if (isPreview) {
			// In preview mode, just show success state without actually submitting
			setIsSubmitted(true);
			setSuccessMessage('Thank you! (Preview mode - no email captured)');
			return;
		}

		setIsPending(true);
		setError(null);

		try {
			if (onEmailCapture) {
				const result = await onEmailCapture({
					bioId: bio.id,
					email: data.email,
					marketingConsent: data.marketingConsent,
					smsMarketingConsent: false, // This component only captures email
				});
				setIsSubmitted(true);
				setSuccessMessage(result.message);
			} else {
				setIsSubmitted(true);
				setSuccessMessage('Thank you!');
			}
			form.reset();
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Something went wrong. Please try again.',
			);
		} finally {
			setIsPending(false);
		}
	};

	if (bio.emailCaptureEnabled === false) return null;

	// Success state
	if (isSubmitted && successMessage) {
		return (
			<div className={cn('mb-8', brandKit.blockStyle === 'full-width' && 'px-6')}>
				<div
					className={cn(
						'rounded-lg p-4 text-center',
						'border-brandKit-text/20 border bg-brandKit-block',
					)}
				>
					<div className='mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brandKit-block'>
						<svg
							className='h-5 w-5 text-brandKit-block-text'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M5 13l4 4L19 7'
							/>
						</svg>
					</div>
					<p className='text-sm font-medium text-brandKit-block-text'>{successMessage}</p>
				</div>
			</div>
		);
	}

	// Form state
	return (
		<div className={cn('mb-8', brandKit.blockStyle === 'full-width' && 'px-6')}>
			<div className='border-brandKit-text/20 rounded-lg border bg-brandKit-block p-4'>
				<p className='mb-3 text-sm font-medium text-brandKit-block-text'>
					{bio.emailCaptureIncentiveText ?? 'Stay connected'}
				</p>

				{
					isPreview ?
						// Simplified preview version without form functionality
						<div className='flex gap-2'>
							<input
								type='email'
								placeholder='Enter your email'
								className='border-brandKit-text/20 flex-1 rounded-md border bg-transparent px-3 py-2 text-sm text-brandKit-block-text'
								disabled
							/>
							<button
								className='rounded-md bg-brandKit-block px-4 py-2 text-sm font-medium text-brandKit-block-text'
								disabled
							>
								Subscribe
							</button>
						</div>
						// Full form for production
					:	<Form form={form} onSubmit={handleSubmit}>
							<div className='space-y-3'>
								<TextField
									control={form.control}
									name='email'
									type='email'
									placeholder='Enter your email address'
									startIcon='email'
									disabled={isPending}
									className='w-full'
									autoComplete='email'
								/>

								{error && (
									<div className='rounded-md bg-red-50 p-2'>
										<p className='text-xs text-red-800'>{error}</p>
									</div>
								)}

								<CheckboxField
									control={form.control}
									name='marketingConsent'
									disabled={isPending}
									label={`I agree to receive marketing communications from ${bio.handle}`}
									className='items-start text-xs'
								/>

								<SubmitButton
									disabled={!form.formState.isValid}
									loading={isPending}
									className='w-full'
									size='sm'
								>
									{form.watch('marketingConsent') ? 'Subscribe' : 'Submit'}
								</SubmitButton>
							</div>
						</Form>

				}
			</div>
		</div>
	);
}

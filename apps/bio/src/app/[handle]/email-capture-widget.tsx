'use client';

import React, { useState } from 'react';
import { useZodForm } from '@barely/hooks';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod/v4';

import { useBioRenderTRPC } from '@barely/api/public/bio-render.trpc.react';

import { CheckboxField } from '@barely/ui/forms/checkbox-field';
import { Form, SubmitButton } from '@barely/ui/forms/form';
import { TextField } from '@barely/ui/forms/text-field';

const emailCaptureSchema = z.object({
	email: z.email('Please enter a valid email address'),
	marketingConsent: z.boolean().default(false),
});

type EmailCaptureFormData = z.infer<typeof emailCaptureSchema>;

interface EmailCaptureWidgetProps {
	bioId: string;
	incentiveText?: string | null;
	workspaceName: string;
}

export function EmailCaptureWidget({
	bioId,
	incentiveText,
	workspaceName,
}: EmailCaptureWidgetProps) {
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const trpc = useBioRenderTRPC();

	const form = useZodForm({
		schema: emailCaptureSchema,
		defaultValues: {
			email: '',
			marketingConsent: false,
		},
	});

	const {
		mutate: captureEmail,
		isPending,
		error,
	} = useMutation(
		trpc.bio.captureEmail.mutationOptions({
			onSuccess: (result: { success: boolean; message: string }) => {
				setIsSubmitted(true);
				setSuccessMessage(result.message);
				form.reset();
			},
		}),
	);

	const handleSubmit = (data: EmailCaptureFormData) => {
		captureEmail({
			bioId,
			email: data.email,
			marketingConsent: data.marketingConsent,
		});
	};

	if (isSubmitted && successMessage) {
		return (
			<div className='rounded-lg border border-green-200 bg-green-50 p-6 text-center'>
				<div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
					<svg
						className='h-6 w-6 text-green-600'
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
				<h3 className='mb-2 text-lg font-medium text-green-900'>Success!</h3>
				<p className='text-green-800'>{successMessage}</p>
			</div>
		);
	}

	return (
		<div className='rounded-lg border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm'>
			<div className='mb-4 text-center'>
				<h3 className='text-lg font-medium text-gray-900'>
					{incentiveText ?? 'Stay Connected'}
				</h3>
				<p className='mt-1 text-sm text-gray-600'>
					Join our mailing list for updates and exclusive content
				</p>
			</div>

			<Form form={form} onSubmit={handleSubmit}>
				<div className='space-y-4'>
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
						<div className='rounded-md bg-red-50 p-3'>
							<p className='text-sm text-red-800'>
								{error.message || 'Something went wrong. Please try again.'}
							</p>
						</div>
					)}

					<CheckboxField
						control={form.control}
						name='marketingConsent'
						disabled={isPending}
						label={`I agree to receive marketing communications from ${workspaceName} by email.`}
						className='items-start text-sm'
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

			{/* Spam protection honeypot */}
			<div className='hidden'>
				<input
					type='text'
					name='website'
					tabIndex={-1}
					autoComplete='off'
					onChange={e => {
						// If this field gets filled, it's likely spam
						if (e.target.value) {
							// Spam detected - field is filled
						}
					}}
				/>
			</div>

			{/* GDPR Notice */}
			<div className='mt-4 text-center'>
				<p className='text-xs text-gray-500'>
					By submitting, you agree to our privacy policy.{' '}
					{/* TODO: Add actual privacy policy link */}
					You can unsubscribe at any time.
				</p>
			</div>
		</div>
	);
}

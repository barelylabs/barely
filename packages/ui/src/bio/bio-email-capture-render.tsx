'use client';

import type { ColorScheme } from '@barely/lib/functions/bio-themes-v2';
import { useState } from 'react';
import { useZodForm } from '@barely/hooks';
import { getComputedStyles } from '@barely/lib/functions/bio-themes-v2';
import { z } from 'zod/v4';

import { CheckboxField } from '../forms/checkbox-field';
import { Form, SubmitButton } from '../forms/form';
import { TextField } from '../forms/text-field';

const emailCaptureSchema = z.object({
	email: z.email('Please enter a valid email address'),
	marketingConsent: z.boolean().default(false),
});

type EmailCaptureFormData = z.infer<typeof emailCaptureSchema>;

interface BioEmailCaptureRenderProps {
	bioId: string;
	incentiveText?: string | null;
	workspaceName: string;
	onSubmit: (
		email: string,
		marketingConsent: boolean,
	) => Promise<{ success: boolean; message: string }>;
	isPreview?: boolean;
	colorScheme?: ColorScheme | null;
}

export function BioEmailCaptureRender({
	incentiveText,
	workspaceName,
	onSubmit,
	isPreview = false,
	colorScheme,
}: BioEmailCaptureRenderProps) {
	const computedStyles = getComputedStyles({ colorScheme });
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
			const result = await onSubmit(data.email, data.marketingConsent);
			setIsSubmitted(true);
			setSuccessMessage(result.message);
			form.reset();
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Something went wrong. Please try again.',
			);
		} finally {
			setIsPending(false);
		}
	};

	// Success state
	if (isSubmitted && successMessage) {
		return (
			<div
				className='rounded-lg p-4 text-center'
				style={{
					backgroundColor: computedStyles.colors.block,
					border: `1px solid ${computedStyles.colors.buttonOutline}`,
				}}
			>
				<div
					className='mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full'
					style={{ backgroundColor: computedStyles.colors.button }}
				>
					<svg
						className='h-5 w-5'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
						style={{ color: computedStyles.colors.buttonText }}
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M5 13l4 4L19 7'
						/>
					</svg>
				</div>
				<p
					className='text-sm font-medium'
					style={{ color: computedStyles.colors.buttonText }}
				>
					{successMessage}
				</p>
			</div>
		);
	}

	// Form state
	return (
		<div
			className='rounded-lg p-4'
			style={{
				backgroundColor: computedStyles.colors.block,
				border: `1px solid ${computedStyles.colors.buttonOutline}`,
			}}
		>
			<p
				className='mb-3 text-sm font-medium'
				style={{ color: computedStyles.colors.blockText }}
			>
				{incentiveText ?? 'Stay connected'}
			</p>

			{
				isPreview ?
					// Simplified preview version without form functionality
					<div className='flex gap-2'>
						<input
							type='email'
							placeholder='Enter your email'
							className='flex-1 rounded-md border bg-transparent px-3 py-2 text-sm'
							style={{
								borderColor: computedStyles.colors.buttonOutline,
								color: computedStyles.colors.blockText,
							}}
							disabled
						/>
						<button
							className='rounded-md px-4 py-2 text-sm font-medium'
							style={{
								backgroundColor: computedStyles.colors.button,
								color: computedStyles.colors.buttonText,
							}}
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
								label={`I agree to receive marketing communications from ${workspaceName}`}
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
	);
}

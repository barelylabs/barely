'use client';

import { useZodForm } from '@barely/hooks';
import { z } from 'zod/v4';

import { CheckboxField } from '@barely/ui/forms/checkbox-field';
import { Form, SubmitButton } from '@barely/ui/forms/form';
import { TextField } from '@barely/ui/forms/text-field';

const emailCaptureSchema = z.object({
	email: z.email('Please enter a valid email address'),
	marketingConsent: z
		.boolean()
		.refine(val => val === true, 'Please consent to receive marketing communications'),
});

type EmailCaptureFormData = z.infer<typeof emailCaptureSchema>;

interface EmailCaptureFormProps {
	onSubmit: (email: string) => void;
	isLoading?: boolean;
	error?: string;
	workspaceName?: string;
}

export function EmailCaptureForm({
	onSubmit,
	isLoading,
	error,
	workspaceName = 'the artist',
}: EmailCaptureFormProps) {
	const form = useZodForm({
		schema: emailCaptureSchema,
		defaultValues: {
			email: '',
			marketingConsent: false,
		},
	});

	const handleSubmit = (data: EmailCaptureFormData) => {
		onSubmit(data.email);
	};

	return (
		<Form form={form} onSubmit={handleSubmit}>
			<div className='space-y-6'>
				<div>
					<TextField
						control={form.control}
						name='email'
						type='email'
						placeholder='Enter your email'
						startIcon='email'
						disabled={isLoading}
						className='w-full'
						autoComplete='email'
						// label='Email address'
						// hideLabel
					/>
					{error && <p className='mt-2 text-sm text-destructive'>{error}</p>}
				</div>

				<CheckboxField
					control={form.control}
					name='marketingConsent'
					disabled={isLoading}
					label={`I consent to ${workspaceName} sending me marketing communications by email.`}
					className='items-start'
				/>

				<SubmitButton
					disabled={!form.formState.isValid}
					loading={isLoading}
					className='w-full text-white'
					size='lg'
				>
					Sign Up & Unlock
				</SubmitButton>

				{/* Legal Notice Card */}
				<div className='rounded-lg border border-border/50 bg-muted/30 p-4 text-center'>
					<p className='text-xs text-muted-foreground'>
						By submitting your information, you agree to the{' '}
						<span className='cursor-pointer underline hover:text-foreground'>
							Privacy Notice
						</span>{' '}
						and{' '}
						<span className='cursor-pointer underline hover:text-foreground'>
							Terms & Conditions
						</span>
						. Under 18? Please make sure you have parental permission.
					</p>
				</div>
			</div>
		</Form>
	);
}

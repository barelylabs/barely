'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@barely/ui/button';
import { Checkbox } from '@barely/ui/checkbox';
import { Input } from '@barely/ui/input';

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
	const [email, setEmail] = useState('');
	const [emailError, setEmailError] = useState('');
	const [marketingConsent, setMarketingConsent] = useState(false);
	const [consentError, setConsentError] = useState('');

	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setEmailError('');
		setConsentError('');

		if (!email) {
			setEmailError('Email is required');
			return;
		}

		if (!validateEmail(email)) {
			setEmailError('Please enter a valid email address');
			return;
		}

		if (!marketingConsent) {
			setConsentError('Please consent to receive marketing communications');
			return;
		}

		onSubmit(email);
	};

	return (
		<form onSubmit={handleSubmit} className='space-y-6'>
			<div>
				<label htmlFor='email' className='sr-only'>
					Email address
				</label>
				<Input
					id='email'
					type='email'
					placeholder='Enter your email'
					startIcon='email'
					value={email}
					onChange={e => setEmail(e.target.value)}
					disabled={isLoading}
					className='w-full'
					autoComplete='email'
					required
				/>
				{(emailError || error) && (
					<p className='mt-2 text-sm text-destructive'>{emailError || error}</p>
				)}
			</div>

			<div className='space-y-2'>
				<div className='flex items-start space-x-2'>
					<Checkbox
						id='consent'
						checked={marketingConsent}
						onCheckedChange={checked => setMarketingConsent(checked as boolean)}
						disabled={isLoading}
						className='mt-1'
					/>
					<label
						htmlFor='consent'
						className='cursor-pointer text-left text-sm text-muted-foreground'
					>
						I consent to {workspaceName} sending me marketing communications by email.
					</label>
				</div>
				{consentError && (
					<p className='text-left text-sm text-destructive'>{consentError}</p>
				)}
			</div>

			<Button
				type='submit'
				disabled={!!isLoading || !marketingConsent}
				className='w-full text-white'
				size='lg'
			>
				{isLoading ?
					<>
						<Loader2 className='mr-2 h-4 w-4 animate-spin' />
						Processing...
					</>
				:	'Sign Up & Unlock'}
			</Button>

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
		</form>
	);
}

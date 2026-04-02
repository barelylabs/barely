'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import { useFmPageTRPC } from '@barely/api/public/fm-page.trpc.react';

import { Button } from '@barely/ui/button';
import { Text } from '@barely/ui/typography';

interface FmPreSaveCallbackProps {
	fmPageId: string;
}

export function FmPreSaveCallback({ fmPageId }: FmPreSaveCallbackProps) {
	const searchParams = useSearchParams();
	const spotifyCode = searchParams.get('spotify_code');
	const presaveError = searchParams.get('presave_error');

	const [step, setStep] = useState<'email' | 'success' | 'error' | 'idle'>('idle');
	const [email, setEmail] = useState('');
	const [fullName, setFullName] = useState('');
	const [emailOptIn, setEmailOptIn] = useState(true);
	const hasProcessed = useRef(false);

	const trpc = useFmPageTRPC();
	const { mutate: createPreSave, isPending } = useMutation(
		trpc.createPreSave.mutationOptions({
			onSuccess: () => setStep('success'),
			onError: () => setStep('error'),
		}),
	);

	useEffect(() => {
		if (presaveError) {
			setStep('error');
			return;
		}
		if (spotifyCode && !hasProcessed.current) {
			hasProcessed.current = true;
			setStep('email');
		}
	}, [spotifyCode, presaveError]);

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			if (!spotifyCode) return;

			const redirectUri = `${window.location.origin}/api/spotify/callback`;
			createPreSave({
				fmPageId,
				code: spotifyCode,
				redirectUri,
				email: email || undefined,
				fullName: fullName || undefined,
				emailMarketingOptIn: emailOptIn,
				timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			});
		},
		[spotifyCode, fmPageId, email, fullName, emailOptIn, createPreSave],
	);

	const handleSkip = useCallback(() => {
		if (!spotifyCode) return;

		const redirectUri = `${window.location.origin}/api/spotify/callback`;
		createPreSave({
			fmPageId,
			code: spotifyCode,
			redirectUri,
			emailMarketingOptIn: false,
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		});
	}, [spotifyCode, fmPageId, createPreSave]);

	if (step === 'idle') return null;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
			<div className='w-full max-w-sm rounded-lg bg-background p-6 shadow-xl'>
				{step === 'email' && (
					<form onSubmit={handleSubmit} className='flex flex-col gap-4'>
						<Text variant='xl/bold'>Almost there!</Text>
						<Text variant='sm/normal' className='text-muted-foreground'>
							Enter your email to get notified when this track drops, and we&apos;ll save
							it to your Spotify library automatically.
						</Text>

						<input
							type='text'
							placeholder='Your name (optional)'
							value={fullName}
							onChange={e => setFullName(e.target.value)}
							className='rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'
						/>

						<input
							type='email'
							placeholder='your@email.com'
							value={email}
							onChange={e => setEmail(e.target.value)}
							className='rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'
						/>

						<label className='flex items-start gap-2 text-sm'>
							<input
								type='checkbox'
								checked={emailOptIn}
								onChange={e => setEmailOptIn(e.target.checked)}
								className='mt-0.5 rounded border-border'
							/>
							<span className='text-muted-foreground'>
								Keep me updated with new releases and news
							</span>
						</label>

						<Button type='submit' disabled={isPending} className='w-full'>
							<span className='font-bold'>
								{isPending ? 'Saving...' : 'Complete Pre-Save'}
							</span>
						</Button>

						<button
							type='button'
							onClick={handleSkip}
							disabled={isPending}
							className='text-center text-sm text-muted-foreground hover:text-foreground'
						>
							Skip, just pre-save
						</button>
					</form>
				)}

				{step === 'success' && (
					<div className='flex flex-col items-center gap-3 text-center'>
						<div className='text-4xl'>&#10003;</div>
						<Text variant='xl/bold'>Pre-saved!</Text>
						<Text variant='sm/normal' className='text-muted-foreground'>
							This track will be saved to your Spotify library on release day.
						</Text>
						<Button
							onClick={() => {
								setStep('idle');
								// Clean up URL params
								const url = new URL(window.location.href);
								url.searchParams.delete('spotify_code');
								url.searchParams.delete('spotify_state');
								window.history.replaceState({}, '', url.pathname);
							}}
							className='mt-2 w-full'
						>
							Done
						</Button>
					</div>
				)}

				{step === 'error' && (
					<div className='flex flex-col items-center gap-3 text-center'>
						<Text variant='xl/bold'>Something went wrong</Text>
						<Text variant='sm/normal' className='text-muted-foreground'>
							{presaveError === 'denied' ?
								'You denied Spotify access. You can try again anytime.'
							:	'There was an error processing your pre-save. Please try again.'}
						</Text>
						<Button
							onClick={() => {
								setStep('idle');
								const url = new URL(window.location.href);
								url.searchParams.delete('spotify_code');
								url.searchParams.delete('spotify_state');
								url.searchParams.delete('presave_error');
								window.history.replaceState({}, '', url.pathname);
							}}
							className='mt-2 w-full'
						>
							Close
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

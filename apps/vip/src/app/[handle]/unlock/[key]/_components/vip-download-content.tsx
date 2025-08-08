'use client';

import { useState } from 'react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';

import { useVipRenderTRPC } from '@barely/api/public/vip-render.trpc.react';

import { Img } from '@barely/ui/img';

import { EmailCaptureForm } from './email-capture-form';
import { VipAudioPlayer } from './vip-audio-player';

export function VipDownloadContent({
	handle,
	swapKey,
}: {
	handle: string;
	swapKey: string;
}) {
	const [emailSent, setEmailSent] = useState(false);
	const [email, setEmail] = useState<string>('');
	const trpc = useVipRenderTRPC();

	const { data: swap } = useSuspenseQuery(
		trpc.swap.byHandleAndKey.queryOptions({ handle, key: swapKey }),
	);

	// Get workspace name from the properly typed swap response
	const workspaceName = swap.workspace.name || 'Artist';

	const {
		mutate: requestDownload,
		isPending,
		isError,
		error,
	} = useMutation({
		...trpc.swap.requestDownload.mutationOptions(),
		onSuccess: () => {
			setEmailSent(true);
		},
	});

	const handleEmailSubmit = (submittedEmail: string) => {
		setEmail(submittedEmail);
		requestDownload({
			handle,
			key: swapKey,
			email: submittedEmail,
		});
	};

	return (
		<div className='text-center'>
			{/* Cover Image */}
			{swap.coverImage?.s3Key && (
				<div className='relative mx-auto mb-8 h-64 w-64 overflow-hidden rounded-lg border-4 border-border/50 shadow-xl sm:h-80 sm:w-80'>
					<Img
						s3Key={swap.coverImage.s3Key}
						alt={swap.name}
						fill
						className='object-cover'
						priority
					/>
				</div>
			)}

			{/* Release Info */}
			{!emailSent ?
				<div className='mb-12 space-y-4'>
					<div>
						<h1 className='text-4xl font-bold tracking-tight text-foreground sm:text-5xl'>
							{swap.name}
						</h1>
						{workspaceName && workspaceName !== 'Artist' && (
							<p className='mt-2 text-sm text-muted-foreground'>{workspaceName}</p>
						)}
					</div>
					<p className='mx-auto max-w-lg text-lg text-muted-foreground'>
						Drop your email to unlock exclusive content and get first access to new music
					</p>

					{swap.description && (
						<p className='mx-auto max-w-md text-base text-muted-foreground'>
							{swap.description}
						</p>
					)}
				</div>
			:	<div className='mb-12'>
					<p className='mx-auto max-w-lg text-lg text-accent-foreground'>
						✨ You've unlocked early access
					</p>
				</div>
			}

			{/* Download Section */}
			<div className='mx-auto mb-12 max-w-sm'>
				{!emailSent ?
					<EmailCaptureForm
						onSubmit={handleEmailSubmit}
						isLoading={isPending}
						error={isError ? error.message : undefined}
						workspaceName={workspaceName}
					/>
				:	<div className='space-y-6'>
						{/* Show audio player if file is audio */}
						{isAudioFile(swap.file.type) && (
							<VipAudioPlayer
								// audioUrl={swap.file.src}
								coverImage={swap.coverImage}
								trackName={swap.name}
								artistName={workspaceName}
								pulse={true}
							/>
						)}

						{/* Email confirmation */}
						<div className='rounded-lg bg-accent/20 p-6 backdrop-blur-sm'>
							<p className='mb-2 text-lg font-medium text-accent-foreground'>
								Check your email for the download!
							</p>
							<p className='text-sm text-muted-foreground'>
								We've sent a high-quality download link to {email}
							</p>
						</div>
					</div>
				}
			</div>
		</div>
	);
}

function isAudioFile(fileType: string): boolean {
	const audioTypes = [
		'audio/mpeg',
		'audio/wav',
		'audio/ogg',
		'audio/mp3',
		'audio/m4a',
		'audio/aac',
		'audio/flac',
		'audio', // Handle simple 'audio' type
	];
	// Check if the file type includes 'audio' anywhere in the string
	return (
		audioTypes.includes(fileType.toLowerCase()) ||
		fileType.toLowerCase().includes('audio')
	);
}

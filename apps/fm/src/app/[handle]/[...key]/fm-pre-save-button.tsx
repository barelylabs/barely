'use client';

import { useMutation } from '@tanstack/react-query';

import { useFmPageTRPC } from '@barely/api/public/fm-page.trpc.react';

import { Button } from '@barely/ui/button';
import { Img } from '@barely/ui/img';

interface FmPreSaveButtonProps {
	fmPageId: string;
	handle: string;
	fmKey: string;
}

export function FmPreSaveButton({ fmPageId, handle, fmKey }: FmPreSaveButtonProps) {
	const trpc = useFmPageTRPC();

	const { mutate: getAuthUrl, isPending } = useMutation(
		trpc.getSpotifyAuthUrl.mutationOptions({
			onSuccess: data => {
				window.location.href = data.authUrl;
			},
		}),
	);

	const handlePreSave = () => {
		const redirectUri = `${window.location.origin}/api/spotify/callback`;
		const returnPath = `${handle}/${fmKey}`;
		getAuthUrl({ fmPageId, redirectUri, returnPath });
	};

	return (
		<div className='flex flex-row items-center justify-between gap-4'>
			<div className='relative h-7 sm:h-8'>
				<Img
					src='/_static/platforms/fm-spotify-dark-logo.png'
					alt='Spotify'
					width={0}
					height={0}
					sizes='150px'
					className='h-full w-auto'
				/>
			</div>
			<Button
				look='outline'
				className='min-w-[100px] border-green-500/60 text-green-600 hover:border-green-500 hover:bg-green-500/10 hover:text-green-500 sm:min-w-[150px] md:text-sm'
				onClick={handlePreSave}
				disabled={isPending}
			>
				<span className='font-extrabold'>{isPending ? 'LOADING...' : 'PRE-SAVE'}</span>
			</Button>
		</div>
	);
}

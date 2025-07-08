'use client';

import type { FmLink } from '@barely/validators';
import { getSpotifyPlaylistTrackDeeplink, isValidUrl } from '@barely/utils';
import { useMutation } from '@tanstack/react-query';

import { useFmPageTRPC } from '@barely/api/public/fm-page.trpc.react';

import { Button } from '@barely/ui/button';
import { Img } from '@barely/ui/img';

export const FmLinkButton = ({ link }: { link: FmLink }) => {
	const theme = 'dark';

	const trpc = useFmPageTRPC();
	const { mutate: logEvent } = useMutation(trpc.log.mutationOptions());

	const label = link.platform === 'itunes' ? 'BUY' : 'PLAY';

	const isSpotifyPlaylist =
		link.platform === 'spotify' && link.url.includes('spotify.com/playlist');
	const hasSpotifyTrackUrl = !!link.spotifyTrackUrl && isValidUrl(link.spotifyTrackUrl);
	// set href with a switch statement
	let href = link.url;

	switch (true) {
		case isSpotifyPlaylist && hasSpotifyTrackUrl && !!link.spotifyTrackUrl:
			href =
				getSpotifyPlaylistTrackDeeplink({
					playlistUrl: link.url,
					trackUrl: link.spotifyTrackUrl,
				}) ?? link.url;
			break;
		default:
			break;
	}

	return (
		<div className='flex flex-row items-center justify-between gap-4'>
			<div className='relative h-7 sm:h-8'>
				<Img
					src={`/_static/platforms/fm-${link.platform.toLowerCase()}-${theme}-logo.png`}
					alt={link.platform}
					width={0}
					height={0}
					sizes='150px'
					className='h-full w-auto'
				/>
			</div>
			<Button
				look='outline'
				className='min-w-[100px] border-foreground/40 text-foreground/60 hover:border-foreground hover:text-foreground sm:min-w-[150px] md:text-sm'
				href={href}
				target='_blank'
				rel='noopener noreferrer'
				onClick={() => {
					logEvent({
						type: 'fm/linkClick',
						fmId: link.fmPageId,
						fmLinkParams: {
							platform: link.platform,
							// url: link.url, // todo: add destination url to event logging
						},
					});
				}}
			>
				<span className='font-extrabold'>{label}</span>
			</Button>
		</div>
	);
};
//

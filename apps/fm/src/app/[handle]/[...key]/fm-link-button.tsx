'use client';

import type { FmLink } from '@barely/lib/server/routes/fm/fm.schema';
import { fmPageApi } from '@barely/lib/server/routes/fm-page/fm-page.api.react';

import { Button } from '@barely/ui/elements/button';
import { Img } from '@barely/ui/elements/img';

export const FmLinkButton = ({ link }: { link: FmLink }) => {
	const theme = 'dark';

	const { mutate: logEvent } = fmPageApi.log.useMutation();

	const label = link.platform === 'itunes' ? 'BUY' : 'PLAY';

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
				href={link.url}
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

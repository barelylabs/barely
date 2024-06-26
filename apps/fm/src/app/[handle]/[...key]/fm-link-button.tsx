'use client';

import type { FmLink } from '@barely/lib/server/routes/fm/fm.schema';

import { Button } from '@barely/ui/elements/button';
import { Img } from '@barely/ui/elements/img';

export const FmLinkButton = ({ link }: { link: FmLink }) => {
	const theme = 'dark';

	return (
		<div className='flex flex-row items-center justify-between gap-4'>
			<div className='relative h-7 sm:h-8'>
				<Img
					src={`/_static/platforms/fm-${link.platform.toLowerCase()}-${theme}-logo.png`}
					alt={link.platform}
					width={100}
					height={100}
					className='h-full w-auto '
					// style={{ width: '100%', height: 'auto' }} // optional
				/>
			</div>
			<Button
				look='outline'
				className='min-w-[100px] sm:min-w-[150px]'
				href={link.url}
				target='_blank'
				rel='noopener noreferrer'
				onClick={() => {
					console.log('clicked');
				}}
			>
				PLAY
			</Button>
		</div>
	);
};
//

'use client';

import * as React from 'react';
import Image from 'next/image';

import { AspectRatio } from '@barely/ui/elements/aspect-ratio';
import { Text } from '@barely/ui/elements/typography';

import { WorkspaceSwitcher } from './workspace-switcher';

export function MainNav() {
	return (
		<div className='hidden h-full items-center gap-3 md:flex'>
			<div className='flex h-full w-6 items-center'>
				{/* <Link href='/campaigns'> */}
				<AspectRatio ratio={1}>
					<Image src='/static/logo.png' alt='barely.io logo' fill priority sizes='40px' />
				</AspectRatio>
				{/* </Link> */}
			</div>
			<Text variant='2xl/bold' className='ml-1 text-muted'>
				/
			</Text>
			<WorkspaceSwitcher />
		</div>
	);
}

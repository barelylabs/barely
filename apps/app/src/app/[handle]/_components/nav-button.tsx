'use client';

import { useContext } from 'react';

import { Button } from '@barely/ui/button';

import { SideNavContext } from './dashboard-layout';

export function NavButton() {
	const { setIsOpen } = useContext(SideNavContext);

	return (
		<Button
			type='button'
			look='ghost'
			onClick={() => setIsOpen(o => !o)}
			variant='icon'
			className='h-8 w-8'
			startIcon='sidebar'
		/>
	);
}

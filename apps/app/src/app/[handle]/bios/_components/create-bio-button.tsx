'use client';

import { Button } from '@barely/ui/button';

import { useBiosSearchParams } from '~/app/[handle]/bios/_components/bio-context';

export function CreateBioButton() {
	const { setShowCreateModal } = useBiosSearchParams();

	return (
		<Button
			onClick={() => setShowCreateModal(true)}
			variant='button'
			className='space-x-3'
		>
			<span>New Bio Page</span>
			<kbd className='hidden h-6 rounded-md border border-border bg-background/80 px-1 text-[10px] sm:inline-block'>
				C
			</kbd>
		</Button>
	);
}

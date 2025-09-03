'use client';

import { cn } from '@barely/utils';

import { Button } from '@barely/ui/button';

import type { BioTab } from '../_hooks/use-bio-query-state';
import { useBioQueryState } from '../_hooks/use-bio-query-state';

const TAB_LABELS: Record<BioTab, string> = {
	blocks: 'Blocks',
	cart: 'Cart',
	'contact-form': 'Contact Form',
	design: 'Design',
	image: 'Image',
	links: 'Links',
	markdown: 'Content',
	'two-panel': 'Two Panel',
};

export function BioTabNavigation() {
	const { tab, setTab } = useBioQueryState();

	return (
		<div className='flex space-x-2 border-b'>
			{Object.entries(TAB_LABELS).map(([key, label]) => (
				<Button
					key={key}
					variant='button'
					look='text'
					size='sm'
					onClick={() => setTab(key as BioTab)}
					className={cn(
						'rounded-b-none border-b-2',
						tab === key ?
							'border-gray-900 text-gray-900'
						:	'border-transparent text-gray-500',
					)}
				>
					{label}
				</Button>
			))}
		</div>
	);
}

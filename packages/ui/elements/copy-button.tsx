'use client';

import { useCopy } from '@barely/lib/hooks/use-copy';

import { Button } from './button';
import { Icon } from './icon';

export function CopyButton({ text }: { text?: string }) {
	const { copyToClipboard } = useCopy();

	return (
		<Button
			variant='icon'
			look='ghost'
			size='sm'
			pill
			className='p-1.5'
			onClick={() => text && copyToClipboard(text)}
		>
			<Icon.copy className='h-2.5 w-2.5' />
		</Button>
	);
}

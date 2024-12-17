'use client';

import { Button } from '@barely/ui/elements/button';

import { useEmailTemplateContext } from './email-template-context';

export function CreateEmailTemplateButton() {
	const { setShowCreateModal } = useEmailTemplateContext();

	return (
		<Button
			onClick={() => {
				setShowCreateModal(true);
			}}
			className='space-x-3'
		>
			<p>New Email Template</p>
			<kbd className='hidden rounded bg-zinc-700 px-2 py-0.5 text-xs font-light text-gray-400 transition-all duration-75 group-hover:bg-gray-100 group-hover:text-gray-500 md:inline-block'>
				C
			</kbd>
		</Button>
	);
}

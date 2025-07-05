'use client';

import { Button } from '@barely/ui/button';

import { useFmContext } from '~/app/[handle]/fm/_components/fm-context';

export function CreateFmPageButton() {
	const { setShowCreateModal } = useFmContext();

	return (
		<Button
			onClick={() => {
				setShowCreateModal(true);
			}}
			className='space-x-3'
		>
			<p>New FM Page</p>
			<kbd className='hidden rounded bg-zinc-700 px-2 py-0.5 text-xs font-light text-gray-400 transition-all duration-75 group-hover:bg-gray-100 group-hover:text-gray-500 md:inline-block'>
				C
			</kbd>
		</Button>
	);
}

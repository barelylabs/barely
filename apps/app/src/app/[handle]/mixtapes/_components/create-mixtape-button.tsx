'use client';

import { Button } from '@barely/ui/elements/button';

import { useMixtapesContext } from '~/app/[handle]/mixtapes/_components/mixtape-context';

export function CreateMixtapeButton() {
	const { setShowCreateMixtapeModal } = useMixtapesContext();

	return (
		<Button
			onClick={() => {
				setShowCreateMixtapeModal(true);
			}}
			className='space-x-3'
		>
			<p>New Mixtape</p>
			<kbd className='hidden rounded bg-zinc-700 px-2 py-0.5 text-xs font-light text-gray-400 transition-all duration-75 group-hover:bg-gray-100 group-hover:text-gray-500 md:inline-block'>
				C
			</kbd>
		</Button>
	);
}

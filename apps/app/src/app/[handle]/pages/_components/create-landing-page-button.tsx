'use client';

import { Button } from '@barely/ui/button';

import { useLandingPageSearchParams } from '~/app/[handle]/pages/_components/landing-page-context';

export function CreateLandingPageButton() {
	const { setShowCreateModal } = useLandingPageSearchParams();

	return (
		<Button
			onClick={() => {
				void setShowCreateModal(true);
			}}
			className='space-x-3'
		>
			<p>New Landing Page</p>
			<kbd className='hidden rounded bg-zinc-700 px-2 py-0.5 text-xs font-light text-gray-400 transition-all duration-75 group-hover:bg-gray-100 group-hover:text-gray-500 md:inline-block'>
				C
			</kbd>
		</Button>
	);
}

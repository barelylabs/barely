'use client';

import { useAtom } from 'jotai';

import { Button } from '@barely/ui/elements/button';

import { showDomainModalAtom } from '~/app/[handle]/settings/domains/domain-modal';

export function AddDomainButton() {
	const [, setShowDomainModal] = useAtom(showDomainModalAtom);

	return (
		<Button onClick={() => setShowDomainModal(true)} className='space-x-3'>
			<p>Add Domain</p>
			<kbd className='hidden rounded bg-zinc-700 px-2 py-0.5 text-xs font-light text-gray-400 transition-all duration-75 group-hover:bg-gray-100 group-hover:text-gray-500 md:inline-block'>
				A
			</kbd>
		</Button>
	);
}

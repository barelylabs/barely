'use client';

import { Button } from '@barely/ui/button';
import { CommandShortcut } from '@barely/ui/command';

import { useProductSearchParams } from '~/app/[handle]/products/_components/product-context';

export function CreateProductButton() {
	const { setShowCreateModal } = useProductSearchParams();

	return (
		<Button
			onClick={() => {
				void setShowCreateModal(true);
			}}
			className='space-x-3'
		>
			<p>New Product</p>
			{/* <kbd className='hidden rounded bg-zinc-700 px-2 py-0.5 text-xs font-light text-gray-400 transition-all duration-75 group-hover:bg-gray-100 group-hover:text-gray-500 md:inline-block'>
				C
			</kbd> */}
			<CommandShortcut variant='button'>C</CommandShortcut>
		</Button>
	);
}

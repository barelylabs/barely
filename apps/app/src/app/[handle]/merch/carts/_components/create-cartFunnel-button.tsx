'use client';

import { Button } from '@barely/ui/button';

import { useCartFunnelSearchParams } from '~/app/[handle]/merch/carts/_components/cartFunnel-context';

export function CreateCartFunnelButton() {
	const { setShowCreateModal: setShowCreateFunnelModal } = useCartFunnelSearchParams();

	return (
		<Button onClick={() => void setShowCreateFunnelModal(true)} className='space-x-3'>
			<p>New Cart</p>
			<kbd className='hidden rounded bg-zinc-700 px-2 py-0.5 text-xs font-light text-gray-400 transition-all duration-75 group-hover:bg-gray-100 group-hover:text-gray-500 md:inline-block'>
				C
			</kbd>
		</Button>
	);
}

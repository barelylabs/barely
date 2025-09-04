'use client';

import { useSearchParams } from 'next/navigation';
import { useWorkspace } from '@barely/hooks';

import { DashContent } from '~/app/[handle]/_components/dash-content';
import { DashContentHeader } from '~/app/[handle]/_components/dash-content-header';
import { BioCartPage } from '../../_components/bio-cart-page';

export default function CartPage() {
	const { handle } = useWorkspace();
	const searchParams = useSearchParams();
	const blockId = searchParams.get('blockId');

	return (
		<>
			<DashContentHeader title='Cart Settings' subtitle='Configure your bio page cart' />
			<DashContent>
				{blockId ?
					<BioCartPage handle={handle} blockId={blockId} />
				:	<div>Please select a cart block from the blocks page</div>}
			</DashContent>
		</>
	);
}

import { cookies } from 'next/headers';
import { api } from '@barely/lib/server/api/server.edge';

import { WorkspaceSocialLinks } from '@barely/ui/components/workspace-social-links';
import { Button } from '@barely/ui/elements/button';
import { H } from '@barely/ui/elements/typography';

import { CartMDX } from '~/app/[handle]/[funnelKey]/_components/cart-mdx';

export default async function CartSuccessPage({
	params,
}: {
	params: {
		handle: string;
		funnelKey: string;
	};
}) {
	const { handle, funnelKey } = params;

	const cartId = cookies().get(`${params.handle}.${params.funnelKey}.cartId`)?.value;
	console.log('cartId', cartId);
	if (!cartId) return null;

	const { funnel } = await api().cart.getByIdAndFunnelKey({
		id: cartId,
		handle,
		funnelKey,
	});

	return (
		<>
			<H size='hero' className='mt-4 text-center text-brand'>
				{funnel.successPageHeadline ?? 'Thank you!'}
			</H>

			<CartMDX markdown={funnel.successPageContent ?? ''} />

			{funnel.successPageCTA && funnel.successPageCTALink && (
				<Button size='xl' look='brand' href={funnel.successPageCTALink}>
					{funnel.successPageCTA}
				</Button>
			)}

			<WorkspaceSocialLinks workspace={funnel.workspace} />
		</>
	);
}

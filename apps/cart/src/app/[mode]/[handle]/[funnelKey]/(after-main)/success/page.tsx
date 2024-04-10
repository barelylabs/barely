import { cookies } from 'next/headers';
import { cartApi } from '@barely/lib/server/routes/cart/cart.api.server';

import { WorkspaceSocialLinks } from '@barely/ui/components/workspace-social-links';
import { Button } from '@barely/ui/elements/button';
import { H } from '@barely/ui/elements/typography';

import { CartMDX } from '~/app/[mode]/[handle]/[funnelKey]/_components/cart-mdx';

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

	if (!cartId) return null;

	const { publicFunnel } = await cartApi.byIdAndParams({
		id: cartId,
		handle,
		funnelKey,
	});

	return (
		<>
			<H size='hero' className='mt-4 text-center text-brand'>
				{publicFunnel.successPageHeadline ?? 'Thank you!'}
			</H>

			<CartMDX markdown={publicFunnel.successPageContent ?? ''} />

			{publicFunnel.successPageCTA && publicFunnel.successPageCTALink && (
				<Button size='xl' look='brand' href={publicFunnel.successPageCTALink}>
					{publicFunnel.successPageCTA}
				</Button>
			)}

			<WorkspaceSocialLinks workspace={publicFunnel.workspace} />
		</>
	);
}
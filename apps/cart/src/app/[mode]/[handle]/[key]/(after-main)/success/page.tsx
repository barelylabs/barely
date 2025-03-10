import { cookies } from 'next/headers';
import { cartApi } from '@barely/lib/server/routes/cart/cart.api.server';

import { WorkspaceSocialLinks } from '@barely/ui/components/workspace-social-links';
import { Button } from '@barely/ui/elements/button';
import { H } from '@barely/ui/elements/typography';

import { CartMDX } from '~/app/[mode]/[handle]/[key]/_components/cart-mdx';
import { SuccessLog } from '~/app/[mode]/[handle]/[key]/(after-main)/success/success-log';

export default async function CartSuccessPage({
	params,
}: {
	params: {
		handle: string;
		key: string;
	};
}) {
	const { handle, key } = params;

	const cartId = cookies().get(`${params.handle}.${params.key}.cartId`)?.value;
	const currentCartStage = cookies().get(
		`${params.handle}.${params.key}.cartStage`,
	)?.value;

	if (!cartId) return null;

	const { publicFunnel } = await cartApi.byIdAndParams({
		id: cartId,
		handle,
		key,
	});

	cartApi
		.log({
			cartId,
			event: 'cart/viewOrderConfirmation',
		})
		.catch(console.error);

	return (
		<>
			<SuccessLog
				handle={handle}
				key={key}
				currentCartStage={currentCartStage ?? 'checkoutCreated'}
			/>

			<H size='1' className='mt-4 text-center text-brand'>
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

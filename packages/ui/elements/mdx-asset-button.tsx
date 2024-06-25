import type { CartFunnel } from '@barely/lib/server/routes/cart-funnel/cart-funnel.schema';
import type { Link } from '@barely/lib/server/routes/link/link.schema';
import type { PressKit } from '@barely/lib/server/routes/press-kit/press-kit.schema';
import { getAbsoluteUrl } from '@barely/lib/utils/url';

import { LoadingOnClickButton } from './button';

export const mdxAssetButton = ({
	cartFunnels,
	links,
	pressKits,
	refererId,
}: {
	cartFunnels: CartFunnel[];
	links: Link[];
	pressKits: PressKit[];
	refererId?: string;
}) => {
	const AssetButton = ({ assetId, label }: { assetId: string; label: string }) => {
		let href = '#';

		const funnel = cartFunnels.find(funnel => funnel.id === assetId);
		if (funnel) {
			href = getAbsoluteUrl('cart', `${funnel?.handle}/${funnel?.key}`);
		}

		const link = links.find(link => link.id === assetId);
		if (link) {
			href = `${link.domain}/${link.key}`;
		}

		const kit = pressKits.find(kit => kit.id === assetId);
		if (kit) {
			href = getAbsoluteUrl('press', '', {
				subdomain: kit.handle,
			});
		}

		const queryParamsString = refererId ? `?refererId=${refererId}` : '';
		href += queryParamsString;

		return (
			<div className='flex w-full flex-col items-center'>
				<LoadingOnClickButton size='xl' href={href} pill look='brand'>
					{label}
				</LoadingOnClickButton>
			</div>
		);
	};

	return {
		AssetButton,
	};
};

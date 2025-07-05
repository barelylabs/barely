import type { CartFunnel, Link, PressKit } from '@barely/validators';
import { getAbsoluteUrl } from '@barely/utils';

import { LoadingLinkButton } from './button';

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
			href = getAbsoluteUrl('cart', `${funnel.handle}/${funnel.key}`);
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

		const url = new URL(href);
		if (refererId) {
			url.searchParams.set('refererId', refererId);
		}
		href = url.toString();

		return (
			<div className='flex w-full flex-col items-center'>
				<LoadingLinkButton size='xl' href={href} pill look='brand'>
					{label}
				</LoadingLinkButton>
			</div>
		);
	};

	return {
		AssetButton,
	};
};

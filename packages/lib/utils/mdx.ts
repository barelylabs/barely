import type { CartFunnel } from '../server/routes/cart-funnel/cart-funnel.schema';
import type { Link } from '../server/routes/link/link.schema';
import type { PressKit } from '../server/routes/press-kit/press-kit.schema';
import { getAbsoluteUrl } from './url';

export function getAssetHref({
	assetId,
	refererId,
	cartFunnels,
	links,
	pressKits,
}: {
	assetId: string;
	refererId: string;
	cartFunnels: CartFunnel[];
	links: Link[];
	pressKits: PressKit[];
}): string {
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

	const url = new URL(href);
	if (refererId) {
		url.searchParams.set('refererId', refererId);
	}
	return url.toString();
}

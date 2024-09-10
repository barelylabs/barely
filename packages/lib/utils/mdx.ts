import type { CartFunnel } from '../server/routes/cart-funnel/cart-funnel.schema';
import type { LandingPage } from '../server/routes/landing-page/landing-page.schema';
import type { Link } from '../server/routes/link/link.schema';
import type { PressKit } from '../server/routes/press-kit/press-kit.schema';
import { getAbsoluteUrl } from './url';

export function getAssetHref({
	assetId,
	// assets
	cartFunnels,
	landingPages,
	links,
	pressKits,
	// tracking
	fanId,
	refererId,
}: {
	assetId: string;
	cartFunnels: CartFunnel[];
	landingPages: LandingPage[];
	links: Link[];
	pressKits: PressKit[];
	fanId?: string;
	refererId: string;
}): string {
	let href = '#';

	const funnel = cartFunnels.find(funnel => funnel.id === assetId);
	if (funnel) {
		href = getAbsoluteUrl('cart', `${funnel?.handle}/${funnel?.key}`);
	}

	const landingPage = landingPages.find(lp => lp.id === assetId);
	if (landingPage) {
		href = getAbsoluteUrl('page', `${landingPage?.handle}/${landingPage?.key}`);
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
	if (fanId) {
		url.searchParams.set('fanId', fanId);
	}
	return url.toString();
}

export function getLinkHref({
	href,
	refererId,
	fanId,
}: {
	href: string;
	refererId: string;
	fanId?: string;
}): string {
	const url = new URL(href);
	if (refererId) {
		url.searchParams.set('refererId', refererId);
	}
	if (fanId) {
		url.searchParams.set('fanId', fanId);
	}
	return url.toString();
}

export function getAssetIdsFromMdx(content: string) {
	const assetIdRegex = /assetId="([^"]+)"/g;
	const assetIds = [...content.matchAll(assetIdRegex)]
		.map(match => match[1])
		.filter(Boolean) as string[];
	console.log('assetIds ', assetIds);

	const cartFunnelIds = assetIds.filter(
		assetId => assetId.startsWith('cart_funnel') || assetId.startsWith('funnel'), //fixme - funnel is a legacy id
	);

	const pressKitIds = assetIds.filter(assetId => assetId.startsWith('pk'));
	const landingPageDestinationIds = assetIds.filter(assetId => assetId.startsWith('lp'));
	const linkIds = assetIds.filter(assetId => assetId.startsWith('link'));

	return {
		cartFunnelIds,
		pressKitIds,
		landingPageDestinationIds,
		linkIds,
		all: assetIds,
	};
}

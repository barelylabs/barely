import type {
	CartFunnel,
	EventTrackingProps,
	LandingPage,
	Link,
	PressKit,
} from '@barely/validators/schemas';
import { EventTrackingKeys } from '@barely/validators/schemas';

import { getAbsoluteUrl } from './barely-urls';

export interface MdxAssets {
	cartFunnels: CartFunnel[];
	landingPages: LandingPage[];
	links: Link[];
	pressKits: PressKit[];
}

export function getAssetHref({
	assetId,
	assets,
	tracking,
}: {
	assetId: string;
	assets: MdxAssets;
	tracking: EventTrackingProps;
}): string {
	let href = '#';

	const { cartFunnels, landingPages, links, pressKits } = assets;

	const funnel = cartFunnels.find(funnel => funnel.id === assetId);
	if (funnel) {
		href = getAbsoluteUrl('cart', `${funnel.handle}/${funnel.key}`);
	}

	const landingPage = landingPages.find(lp => lp.id === assetId);
	if (landingPage) {
		href = getAbsoluteUrl('page', `${landingPage.handle}/${landingPage.key}`);
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

	const url = getLinkHref({ href, tracking });
	return url.toString();
}

export function getLinkHref({
	href,
	tracking,
}: {
	href: string;
	tracking: EventTrackingProps;
}): string {
	const url = new URL(href);

	for (const key of EventTrackingKeys) {
		const value = tracking[key];
		if (value) {
			url.searchParams.set(key, value);
		}
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

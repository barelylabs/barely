export function getLandingPageAssetJoins({
	content,
	landingPageId,
}: {
	content: string;
	landingPageId: string;
}) {
	const assetIdRegex = /assetId="([^"]+)"/g;
	const assetIds = [...content.matchAll(assetIdRegex)]
		.map(match => match[1])
		.filter(Boolean) as string[];
	console.log('assetIds ', assetIds);

	const cartFunnelIds = assetIds.filter(
		assetId => assetId.startsWith('cart_funnel') || assetId.startsWith('funnel'), //fixme - funnel is a legacy id
	);

	const pressKitIds = assetIds.filter(assetId => assetId.startsWith('pk'));
	const linkIds = assetIds.filter(assetId => assetId.startsWith('link'));

	const cartFunnelJoins = cartFunnelIds.map(assetId => ({
		landingPageId,
		cartFunnelId: assetId,
	}));

	const pressKitJoins = pressKitIds.map(assetId => ({
		landingPageId,
		pressKitId: assetId,
	}));

	const linkJoins = linkIds.map(assetId => ({
		landingPageId,
		linkId: assetId,
	}));

	return {
		cartFunnelIds,
		cartFunnelJoins,
		linkIds,
		linkJoins,
		pressKitIds,
		pressKitJoins,
	};
}

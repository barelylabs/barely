import { getAssetIdsFromMdx } from '../../../utils/mdx';

export function getLandingPageAssetJoins({
	content,
	landingPageId,
}: {
	content: string;
	landingPageId: string;
}) {
	const { cartFunnelIds, pressKitIds, landingPageDestinationIds, linkIds } =
		getAssetIdsFromMdx(content);

	const cartFunnelJoins = cartFunnelIds.map(assetId => ({
		landingPageId,
		cartFunnelId: assetId,
	}));

	const landingPageJoins = landingPageDestinationIds.map(assetId => ({
		landingPageSourceId: landingPageId,
		landingPageDestinationId: assetId,
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
		landingPageDestinationIds,
		landingPageJoins,
		linkIds,
		linkJoins,
		pressKitIds,
		pressKitJoins,
	};
}

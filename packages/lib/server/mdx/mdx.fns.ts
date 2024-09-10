import { inArray } from 'drizzle-orm';

import { getAssetIdsFromMdx } from '../../utils/mdx';
import { dbHttp } from '../db';
import { CartFunnels } from '../routes/cart-funnel/cart-funnel.sql';
import { LandingPages } from '../routes/landing-page/landing-page.sql';
import { Links } from '../routes/link/link.sql';
import { PressKits } from '../routes/press-kit/press-kit.sql';

export async function getAssetsFromMdx(content: string) {
	const assetIds = getAssetIdsFromMdx(content);

	const [cartFunnelsResult, pressKitsResult, landingPagesResult, linksResult] =
		await Promise.allSettled([
			dbHttp.query.CartFunnels.findMany({
				where: inArray(CartFunnels.id, assetIds.cartFunnelIds),
			}),
			dbHttp.query.PressKits.findMany({
				where: inArray(PressKits.id, assetIds.pressKitIds),
			}),
			dbHttp.query.LandingPages.findMany({
				where: inArray(LandingPages.id, assetIds.landingPageDestinationIds),
			}),
			dbHttp.query.Links.findMany({
				where: inArray(Links.id, assetIds.linkIds),
			}),
		]);

	const cartFunnels =
		cartFunnelsResult.status === 'fulfilled' ? cartFunnelsResult.value : [];
	const pressKits = pressKitsResult.status === 'fulfilled' ? pressKitsResult.value : [];
	const landingPages =
		landingPagesResult.status === 'fulfilled' ? landingPagesResult.value : [];
	const links = linksResult.status === 'fulfilled' ? linksResult.value : [];

	return {
		cartFunnels,
		pressKits,
		landingPages,
		links,
	};
}

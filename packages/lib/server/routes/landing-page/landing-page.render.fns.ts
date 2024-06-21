import { and, eq } from 'drizzle-orm';

import type { CartFunnel } from '../cart-funnel/cart-funnel.schema';
import type { Link } from '../link/link.schema';
import type { PressKit } from '../press-kit/press-kit.schema';
import { db } from '../../db';
import { LandingPages } from './landing-page.sql';

export async function getLandingPageData({
	handle,
	key,
}: {
	handle: string;
	key: string;
}) {
	const lpRaw = await db.http.query.LandingPages.findFirst({
		where: and(eq(LandingPages.handle, handle), eq(LandingPages.key, key)),
		with: {
			workspace: {
				columns: {
					name: true,
					handle: true,
					brandHue: true,
					brandAccentHue: true,
				},
			},
			_cartFunnels: {
				with: {
					cartFunnel: true,
				},
			},
			_links: {
				with: {
					link: true,
				},
			},
			_pressKits: {
				with: {
					pressKit: true,
				},
			},
		},
	});

	if (!lpRaw) {
		return null;
	}

	const { _cartFunnels, _links, _pressKits, ...lp } = lpRaw;

	const cartFunnels: CartFunnel[] = [];
	const links: Link[] = [];
	const pressKits: PressKit[] = [];

	_cartFunnels.map(({ cartFunnel }) => {
		if (cartFunnel) cartFunnels.push(cartFunnel);
	});
	_links.map(({ link }) => {
		if (link) links.push(link);
	});
	_pressKits.map(({ pressKit }) => {
		if (pressKit) pressKits.push(pressKit);
	});

	return {
		...lp,
		cartFunnels,
		links,
		pressKits,
	};
}

'use server';

import { cookies } from 'next/headers';

export async function setCartCookie({
	handle,
	funnelKey,
	cartId,
}: {
	handle: string;
	funnelKey: string;
	cartId: string;
}) {
	await Promise.resolve();
	cookies().set(`${handle}.${funnelKey}.cartId`, cartId, {
		maxAge: 60 * 60 * 24 * 7, // 7 days
	});
}

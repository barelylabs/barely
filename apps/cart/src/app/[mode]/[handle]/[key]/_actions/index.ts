'use server';

import { cookies } from 'next/headers';

export async function setCartCookie({
	handle,
	key,
	cartId,
	fbclid,
	refererId,
}: {
	handle: string;
	key: string;
	cartId: string;
	fbclid: string | null;
	refererId?: string;
}) {
	await Promise.resolve();
	cookies().set(`${handle}.${key}.cartId`, cartId, {
		maxAge: 60 * 60 * 24 * 7, // 7 days
	});

	if (fbclid) {
		cookies().set(`${handle}.${key}.fbclid`, fbclid, {
			maxAge: 60 * 60 * 24 * 7, // 7 days
		});
	}

	if (refererId) {
		cookies().set(`${handle}.${key}.refererId`, refererId, {
			maxAge: 60 * 60 * 24 * 7, // 7 days
		});
	}
}

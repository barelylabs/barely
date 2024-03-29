import type { NextRequest } from 'next/server';
import { checkForAbandonedUpsellCarts } from '@barely/lib/server/cart.fns';

export async function POST(req: NextRequest) {
	const headers = req.headers;
	console.log(headers);
	// todo require auth header
	await checkForAbandonedUpsellCarts();
}

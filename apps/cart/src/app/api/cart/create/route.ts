import { NextResponse } from 'next/server';
import {
	createMainCartFromFunnel,
	getFunnelByParams,
} from '@barely/lib/functions/cart.fns';
import { log } from '@barely/lib/utils/log';

interface CreateCartBody {
	handle: string;
	key: string;
	cartId: string;
	shipTo?: {
		country: string | null;
		state: string | null;
		city: string | null;
	};
}

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as CreateCartBody;
		const { handle, key, cartId, shipTo } = body;

		if (!handle || !key || !cartId) {
			return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
		}

		const funnel = await getFunnelByParams(handle, key);

		if (!funnel) {
			await log({
				location: 'api/cart/create',
				message: `Funnel not found for ${handle}/${key}`,
				type: 'errors',
			});
			return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
		}

		const cart = await createMainCartFromFunnel({
			funnel,
			visitor: null, // We don't have visitor info in this context
			shipTo,
			cartId,
		});

		return NextResponse.json({ success: true, cartId: cart.id });
	} catch (error) {
		await log({
			location: 'api/cart/create',
			message: `Error creating cart: ${String(error)}`,
			type: 'errors',
		});

		return NextResponse.json({ error: 'Failed to create cart' }, { status: 500 });
	}
}

// This endpoint should only accept POST requests
export function GET() {
	return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

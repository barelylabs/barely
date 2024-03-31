import { cache } from 'react';
import { headers } from 'next/headers';

import { createCallerFactory, createTRPCContext } from '../../api/trpc';
import { auth } from '../../auth';
import { cartRouter } from './cart.router';

const createContext = cache(async () => {
	const heads = new Headers(headers());
	// console.log("heads", heads);
	heads.set('x-trpc-source', 'rsc');

	return createTRPCContext({
		session: await auth(),
		headers: heads,
	});
});

const createCaller = createCallerFactory(cartRouter);

export const cartApi = createCaller(() => createContext());

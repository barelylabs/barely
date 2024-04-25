import { cache } from 'react';
import { headers } from 'next/headers';

import { createCallerFactory, createTRPCContext } from '../../api/trpc';
import { providerAccountRouter } from './provider-account.router';

const createContext = cache(() => {
	const heads = new Headers(headers());
	heads.set('x-trpc-source', 'rsc');

	return createTRPCContext({
		session: null,
		headers: heads,
	});
});

const createCaller = createCallerFactory(providerAccountRouter);

export const cartApi = createCaller(() => createContext());

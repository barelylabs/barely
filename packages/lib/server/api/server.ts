import { cache } from 'react';
import { headers } from 'next/headers';

import { auth } from '../auth';
import { dbPool } from '../db';
import { appRouter } from './router';
import { createCallerFactory, createTRPCContext } from './trpc';

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
interface ServerContextProps {
	// dbPool: DbPool;
	handle?: string;
}

const createContext = cache(async ({ handle }: ServerContextProps) => {
	const heads = new Headers(headers());

	heads.set('x-trpc-source', 'rsc');
	if (handle) heads.set('x-workspace-handle', handle);

	return createTRPCContext({
		session: await auth(),
		headers: heads,
		dbPool,
	});
});

const createCaller = createCallerFactory(appRouter);

export const api = (props: ServerContextProps) =>
	createCaller(() => createContext(props));

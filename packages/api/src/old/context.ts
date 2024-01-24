import { getServerSession } from '@barely/auth';
import { prisma, User } from '@barely/db';

import { type inferAsyncReturnType } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';

interface CreateContextOptions {
	user: User | null;
	rsc: boolean;
}

export async function createContext(
	opts: ({ type: 'api' } & CreateNextContextOptions) | { type: 'rsc'; getUser: null }, // typeof getUser },
) {
	// rsc
	if (opts.type === 'rsc') {
		return {
			type: 'rsc',
			user: null, // todo await opts.getUser(),
			prisma,
		};
	}

	// api
	const session = await getServerSession(opts);
	return {
		type: 'api',
		user: session?.user ?? null,
		prisma,
	};
}

export type Context = inferAsyncReturnType<typeof createContext>;

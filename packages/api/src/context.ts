import { getServerSession, type Session } from '@barely/auth';
import { prisma, User } from '@barely/db';

import { type inferAsyncReturnType } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';

/**
 * Replace this with an object if you want to pass things to createContextInner
 */
interface CreateContextOptions {
	user: User | null;
	rsc: boolean;
}

/** Use this helper for:
 *  - testing, where we dont have to Mock Next.js' req/res
 *  - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://beta.create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
// export const createContextInner = async (opts: CreateContextOptions) => {
//   return {
//     user: opts.user,
//   };
// };

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
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

// import { getServerSession, type Session } from '@barely/auth';
import { prisma } from '@barely/db';
// import { prisma, User } from '@barely/db';

import { type inferAsyncReturnType } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { getAuth, clerkClient } from '@clerk/nextjs/server';
import type { User } from '@clerk/nextjs/api';
/**
 * Replace this with an object if you want to pass things to createContextInner
 */
// interface CreateContextOptions {
// 	session: Session;
// 	user: User | null;
// 	rsc: boolean;
// }

type IUserProps = {
	user: User | null;
};

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
export const createContextInner = async ({ user }: IUserProps) => {
	return {
		user,
		prisma,
	};
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export async function createContext(opts: CreateNextContextOptions) {
	async function getUser() {
		const { userId } = getAuth(opts.req);
		const user = userId ? await clerkClient.users.getUser(userId) : null;
		return user;
	}

	const user = await getUser();
	return await createContextInner({ user });
	// // rsc
	// if (opts.type === 'rsc') {
	// 	return {
	// 		type: 'rsc',
	// 		session: null,
	// 		user: null, // todo await opts.getUser(),
	// 		prisma,
	// 	};
	// }

	// // api
	// const session = await getServerSession(opts);
	// return {
	// 	type: 'api',
	// 	session,
	// 	user: session?.user ?? null,
	// 	prisma,
	// };
}

export type Context = inferAsyncReturnType<typeof createContext>;

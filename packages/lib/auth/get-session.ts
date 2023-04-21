import type { NextApiRequest, NextApiResponse } from 'next';

// import { NextRequest, NextResponse } from 'next/server';

import { getServerSession as $getServerSession } from 'next-auth';

import { authOptions } from './auth-options';

type GetServerSessionContext =
	// | {
	// 		req: GetServerSidePropsContext['req'];
	// 		res: GetServerSidePropsContext['res'];
	// }
	// | { req: NextRequest;  res: NextResponse }
	{ req: NextApiRequest; res: NextApiResponse };

const getServerSessionAPI = async (ctx: GetServerSessionContext) => {
	const serverSession = await $getServerSession(ctx.req, ctx.res, authOptions);
	// console.log('serverSessionAPI => , ', serverSession);
	return serverSession;
};

const getServerSession = async () => {
	const session = await $getServerSession(authOptions);
	return session;
};

const getServerUser = async () => {
	const session = await getServerSession();
	return session?.user ?? null;
};

export { getServerSession, getServerSessionAPI, getServerUser };

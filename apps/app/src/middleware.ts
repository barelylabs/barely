import { NextResponse } from 'next/server';

import { withAuth } from 'next-auth/middleware';

// const publicPaths = ['/', '/login*', '/register*', '/api*', '/playlist-pitch*'];

// const pathIsPublic = (path: string) => {
// 	const matchingPublicPath = publicPaths.find(x =>
// 		path.match(new RegExp(`^${x}$`.replace('*$', '($|/)'))),
// 	);
// 	return !!matchingPublicPath;
// };

// const pathIsApi = (path: string) => {
// 	return path.match(/^\/api\//);
// };

// const pathIsLogout = (path: string) => {
// 	return path.startsWith('/logout');
// };

export default withAuth(
	function middleware() {
		// const isPublic = pathIsPublic(req.nextUrl.pathname);
		// const isLogout = pathIsLogout(req.nextUrl.pathname);

		// const searchParams = req.nextUrl.searchParams;
		// const redirectPath = searchParams.get('redirect_path');
		// const redirectUrl = req.nextUrl.clone();
		// redirectUrl.pathname = redirectPath ?? '/campaigns';

		// if (isPublic) return NextResponse.next();

		// console.log('req.nextauth.token => ', req.nextauth.token);

		// if (!req.nextauth.user) {
		// 	const loginUrl = new URL('/login', req.url);
		// 	loginUrl.searchParams.set('redirect', !isLogout ? req.url : '/campaigns');
		// 	return NextResponse.redirect(loginUrl);
		// }
		return NextResponse.next();
	},
	// {
	// 	callbacks: {
	// 		authorized: ({ token }) => {
	// 			console.log('token => ', token);
	// 			return token?.role === 'admin';
	// 		},
	// 	},
	// },
);

export const config = {
	matcher: [
		'/accounts/:path*',
		'/campaigns/:path*',
		'/chat/:path*',
		'/dev/:path*',
		'/links/:path*',
		'/playlists/:path*',
		'/screen/:path*',
	],
};

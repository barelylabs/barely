import { withClerkMiddleware, getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Set the paths that don't require the user to be signed in
const publicPaths = ['/', '/sign-in*', '/sign-up*', '/api*'];

const pathIsPublic = (path: string) => {
	const matchingPublicPath = publicPaths.find(x =>
		path.match(new RegExp(`^${x}$`.replace('*$', '($|/)'))),
	);
	return !!matchingPublicPath;
};

export default withClerkMiddleware((request: NextRequest) => {
	const { userId } = getAuth(request);
	const isPublic = pathIsPublic(request.nextUrl.pathname);

	const searchParams = request.nextUrl.searchParams;
	const redirectPath = searchParams.get('redirect_path');
	const redirectUrl = request.nextUrl.clone();
	redirectUrl.pathname = redirectPath || '/campaigns';

	console.log('userId => ', userId);
	console.log('isPublic => ', isPublic);

	if (isPublic && userId) return NextResponse.redirect(redirectUrl);
	if (isPublic) return NextResponse.next();

	// if the user is not signed in redirect them to the sign in page.

	if (!userId) {
		const signInUrl = new URL('/signin', request.url);
		signInUrl.searchParams.set('redirect_url', request.url);
		return NextResponse.redirect(signInUrl);
	}
	return NextResponse.next();
});

// export const config = { matcher: '/((?!.*\\.).*)' };

export const config = {
	matcher: [
		'/account/:path*',
		'/api/:path*',
		'/campaigns/:path*',
		'/chat/:path*',
		'/dev/:path*',
		'/links/:path*',
		'/sign-in',
		'/sign-up',
		//
	],
};

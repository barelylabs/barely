import { withClerkMiddleware, getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Set the paths that don't require the user to be signed in
const publicPaths = ['/', '/signin*', '/signup*'];

const isPublic = (path: string) => {
	return publicPaths.find(x => path.match(new RegExp(`^${x}$`.replace('*$', '($|/)'))));
};

export default withClerkMiddleware((request: NextRequest) => {
	if (isPublic(request.nextUrl.pathname)) {
		return NextResponse.next();
	}
	// if the user is not signed in redirect them to the sign in page.
	const { userId } = getAuth(request);

	if (!userId) {
		// redirect the users to /pages/sign-in/[[...index]].ts

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
		'/campaigns/:path*',
		'/chat/:path*',
		'/dev/:path*',
		'/links/:path*',
		//
	],
};

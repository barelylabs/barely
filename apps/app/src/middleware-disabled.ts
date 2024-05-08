import { NextResponse } from 'next/server';
import { getDefaultWorkspaceOfCurrentUser } from '@barely/lib/server/auth/auth.fns';
import { getAbsoluteUrl } from '@barely/lib/utils/url';
import { auth } from '@barely/server/auth';

export default auth(async req => {
	if (!req.auth?.user) {
		console.log('no user, redirecting to login');
		return NextResponse.redirect(getAbsoluteUrl('app', 'login'));
	}

	if (req.nextUrl.pathname === '/') {
		const defaultWorkspace = await getDefaultWorkspaceOfCurrentUser();
		return NextResponse.redirect(
			getAbsoluteUrl('app', `${defaultWorkspace.handle}/links`),
		);
	}

	return NextResponse.next();
});

export const config = {
	matcher: [
		'/((?!api|_static|_next/static|login|logout|register|privacy|terms|_next/image|favicon.ico).*)',
	],
};

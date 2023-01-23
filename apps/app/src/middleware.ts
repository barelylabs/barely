export { default } from 'next-auth/middleware';

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - pitch (pitch page from marketing)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!api|pitch|signin|signup|_next/static|_next/image|favicon.ico).*)',
	],
};

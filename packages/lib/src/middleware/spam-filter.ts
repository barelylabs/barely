import { NextResponse } from 'next/server';

const SPAM_PATTERNS = [
	'.php',
	'license.txt',
	'wp-content',
	'wp-admin',
	'wp-includes',
	'wp-login',
	'xmlrpc',
	'.trash',
	'.env',
];

export function isSpamRequest(pathname: string): boolean {
	const lower = pathname.toLowerCase();
	return SPAM_PATTERNS.some(pattern => lower.includes(pattern));
}

export function spamResponse() {
	return new NextResponse('Nice try. This isn\'t WordPress. Stop fucking with us.', {
		status: 418,
	});
}

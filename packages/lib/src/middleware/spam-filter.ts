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
	'phpinfo',
	'_profiler',
	'_environment',
	'.git',
];

export function isSpamRequest(pathname: string): boolean {
	const lower = pathname.toLowerCase();
	const matched = SPAM_PATTERNS.find(pattern => lower.includes(pattern));
	if (matched) console.log(`[spam-filter] blocked "${pathname}" (matched: ${matched})`);
	return !!matched;
}

export function spamResponse() {
	return new NextResponse('Nice try. Pls go away.', {
		status: 418,
	});
}

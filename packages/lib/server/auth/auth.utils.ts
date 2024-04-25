import { env } from 'process';

export async function hashToken(token: string) {
	const encoder = new TextEncoder();
	const data = encoder.encode(`${token}${env.NEXTAUTH_SECRET}`);
	const buffer = await crypto.subtle.digest('SHA-256', data);
	const hashedToken = Array.from(new Uint8Array(buffer), byte =>
		byte.toString(16).padStart(2, '0'),
	).join('');
	return hashedToken;
}

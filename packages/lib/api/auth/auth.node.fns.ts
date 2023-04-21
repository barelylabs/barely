import { createHash, randomBytes } from 'crypto';

import { prisma } from '@barely/db';

import env from '../../env';

const createLoginLink = async (props: {
	provider: 'email' | 'phone';
	identifier: string;
	callbackUrl?: string;
	expiresInSeconds?: number;
}) => {
	const { provider, identifier, expiresInSeconds } = props;

	const token = randomBytes(32).toString('hex');
	// hashing the same way the next-auth library does => https://github.com/nextauthjs/next-auth/blob/62f672ae30fb389c1a81f484f2dad7a3e2a6a662/packages/next-auth/src/core/lib/utils.ts
	const hashedToken = createHash('sha256')
		.update(`${token}${env.NEXTAUTH_SECRET}`)
		.digest('hex');

	const callbackUrl = props.callbackUrl ?? `${env.NEXT_PUBLIC_APP_BASE_URL}/campaigns`;
	const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;
	const expiresIn = expiresInSeconds ?? THIRTY_DAYS_IN_SECONDS;

	const expires = new Date(Date.now() + expiresIn * 1000);

	await prisma.verificationToken.create({
		data: {
			token: hashedToken,
			expires,
			identifier,
		},
	});

	const params = new URLSearchParams({
		token,
		callbackUrl,
	});

	if (provider === 'email') params.append('email', identifier);
	if (provider === 'phone') params.append('phone', identifier);

	return `${
		env.NEXT_PUBLIC_APP_BASE_URL
	}/api/auth/callback/${provider}?${params.toString()}`;
};

export { createLoginLink };

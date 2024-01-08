// import { VerificationToken as AuthVerificationToken } from 'next-auth/adapters';
import {VerificationToken as AuthVerificationToken} from '@auth/core/adapters';

import { VerificationToken } from './verification-token.schema';

export function deserializeVerificationToken(verificationToken: VerificationToken) {
	const authVerificationToken: AuthVerificationToken = {
		...verificationToken,
		expires: new Date(verificationToken.expires),
	};

	return authVerificationToken;
}

export function serializeVerificationToken(verificationToken: AuthVerificationToken) {
	const token: VerificationToken = {
		...verificationToken,
		expires: verificationToken.expires.toISOString(),
	};

	return token;
}

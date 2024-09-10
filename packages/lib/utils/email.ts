import { z } from 'zod';

import type { Db } from '../server/db';
import type { EmailAddress } from '../server/routes/email-address/email-address.schema';
import type { EmailDomain } from '../server/routes/email-domain/email-domain.schema';

export function isRealEmail(email: string) {
	const isRealEmail = z.string().email().safeParse(email);

	if (!isRealEmail.success) {
		return false;
	}

	return true;
}

export async function checkEmailExists(email: string, db?: Db) {
	if (window === undefined && !!db) {
		const { checkEmailExistsOnServer } = await import('../server/routes/user/user.fns');
		return checkEmailExistsOnServer(email);
	}

	const { checkEmailExistsServerAction } = await import(
		'../server/routes/user/user.actions'
	);
	return checkEmailExistsServerAction(email);
}

export function getEmailAddressFromEmailAddress(
	email: Pick<EmailAddress, 'username'> & { domain: EmailDomain },
) {
	return `${email.username}@${email.domain.name}`;
}

import type { Db } from '@barely/db/client';
import type { EmailAddress, EmailDomain } from '@barely/validators/schemas';

// export function isRealEmail(email: string) {
// 	const isRealEmail = z.email().safeParse(email);

// 	if (!isRealEmail.success) {
// 		return false;
// 	}

// 	return true;
// }

export async function checkEmailExists(email: string, db?: Db) {
	if (db) {
		const { checkEmailExistsOnServer } = await import('./user.fns');
		return checkEmailExistsOnServer(email);
	}

	const { checkEmailExistsServerAction } = await import('../actions/user.actions');
	return checkEmailExistsServerAction(email);
}

export function getEmailAddressFromEmailAddress(
	email: Pick<EmailAddress, 'username'> & { domain: EmailDomain },
) {
	return `${email.username}@${email.domain.name}`;
}

import type { EmailAddress, EmailDomain } from '@barely/validators';

export function getEmailAddressFromEmailAddress(
	email: Pick<EmailAddress, 'username'> & { domain: EmailDomain },
) {
	return `${email.username}@${email.domain.name}`;
}

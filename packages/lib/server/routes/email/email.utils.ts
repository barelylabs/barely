import type { EmailAddress } from '../email-address/email-address.schema';
import type { EmailDomain } from '../email-domain/email-domain.schema';

export function getEmailAddressFromEmailAddress(
	email: EmailAddress & { domain: EmailDomain },
) {
	return `${email.username}@${email.domain.name}`;
}
